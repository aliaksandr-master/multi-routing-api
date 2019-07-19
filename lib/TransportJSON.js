import 'whatwg-fetch';
import Response from './Response';
import RequestTransport from './Transport';
import { reduce, isFunction } from './utils';


const HEADER_CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';


const fetchOptionNames = [
  'method',
  'headers',
  'mode',
  'credentials',
  'cache',
  'redirect'
];

const hooks = [];

const mkFetchOptions = (method, options, data) => {
  const fetchOptions = fetchOptionNames.reduce((fetchOptions, optionName) => {
    if (options.hasOwnProperty(optionName)) {
      fetchOptions[optionName] = options[optionName];
    }

    return fetchOptions;
  }, { headers: {}, method: method.toUpperCase(), credentials: 'same-origin' });

  if (!fetchOptions.headers.hasOwnProperty('Accept')) {
    fetchOptions.headers.Accept = APPLICATION_JSON;
  }

  if (!options.ignoreContentType && ![ 'HEAD', 'GET' ].includes(fetchOptions.method)) {
    if (!fetchOptions.headers.hasOwnProperty(HEADER_CONTENT_TYPE)) {
      fetchOptions.headers[HEADER_CONTENT_TYPE] = APPLICATION_JSON;
    }
  }

  if (data != null) {
    fetchOptions.body = fetchOptions.headers[HEADER_CONTENT_TYPE] === APPLICATION_JSON ? JSON.stringify(data) : data;
  } else {
    delete fetchOptions.body;
  }

  fetchOptions.headers = reduce(fetchOptions.headers, (headers, value, key) => {
    headers.append(key, value);

    return headers;
  }, new window.Headers());

  return fetchOptions;
};


export default class RequestTransportJSON extends RequestTransport {
  static addHook ({ testFunc, responseFunc }) {
    if (!isFunction(testFunc)) {
      throw new TypeError('testFunc is not a function');
    }

    if (!isFunction(responseFunc)) {
      throw new TypeError('responseFunc is not a function');
    }

    hooks.push({ testFunc, responseFunc });
  }

  request (method, address, data, options = {}) {
    const { disableParsing } = options;
    const hook = hooks.find(({ testFunc }) => testFunc(method, address, data, options));

    if (hook) {
      return hook.responseFunc(method, address, data, options);
    }

    return window.fetch(address, mkFetchOptions(method, options, data))
      .then((rawResponse) => {
        if (rawResponse.headers.get('Content-Length') === '0' || disableParsing) {
          return new Response({ result: null, ok: rawResponse.ok, status: rawResponse.status, rawResponse, options });
        }

        return rawResponse.text()
          .then((jsonText) => {
            if (!jsonText) {
              return {};
            }

            let obj = null;

            try {
              obj = JSON.parse(jsonText);
            } catch (err) {
              return err;
            }

            return obj;
          })
          .then((result) => {
            const isError = result instanceof Error;
            const ok = isError ? false : rawResponse.ok;
            const status = isError ? this.defaultStatus || 0 : rawResponse.status;

            return new Response({ result, ok, status, rawResponse, options });
          });
      })
      .catch((err) => new Response({ ok: false, status: 0, result: null, error: err, rawResponse: null, options })); // in case request was canceled;
  }
}
