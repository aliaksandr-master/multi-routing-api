import 'whatwg-fetch';
import Response from './Response';
import RequestTransport from './Transport';
import { reduce } from './utils';


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


export default class RequestTransportJSON extends RequestTransport {
  request (method, address, data, { disableParsing, ...options } = {}) {
    method = method.toUpperCase();

    const _fetchOptions = fetchOptionNames.reduce((_fetchOptions, optionName) => {
      if (options.hasOwnProperty(optionName)) {
        _fetchOptions[optionName] = options[optionName];
      }

      return _fetchOptions;
    }, { headers: {} });

    const fetchOptions = {
      ..._fetchOptions,
      headers: { ..._fetchOptions.headers }, // only for immutability
      method
    };

    delete fetchOptions.body;

    if (!fetchOptions.headers.hasOwnProperty('Accept')) {
      fetchOptions.headers.Accept = APPLICATION_JSON;
    }

    if (![ 'HEAD', 'GET' ].includes(fetchOptions.method)) {
      if (!fetchOptions.headers.hasOwnProperty(HEADER_CONTENT_TYPE)) {
        fetchOptions.headers[HEADER_CONTENT_TYPE] = APPLICATION_JSON;
      }
    }

    if (data != null) {
      fetchOptions.body = fetchOptions.headers[HEADER_CONTENT_TYPE] === APPLICATION_JSON ? JSON.stringify(data) : data;
    }

    fetchOptions.headers = reduce(fetchOptions.headers, (headers, value, key) => {
      headers.append(key, value);

      return headers;
    }, new window.Headers());

    return window.fetch(address, fetchOptions)
      .then((response) => {
        if (response.headers.get('Content-Length') === '0') {
          return { response, result: null };
        }

        if (disableParsing) {
          return Promise.resolve({ response, result: null });
        }

        return response.text()
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
          .then((result) => ({ response, result }));
      })
      .then(
        ({ response, result }) => {
          const responseInstance = new Response({ result, ok: response.ok, status: response.status, rawResponse: response, options });

          if (result instanceof Error) {
            responseInstance.ok = false;
            responseInstance.status = this.defaultStatus || null;
          }

          return responseInstance;
        }
      );
  }
}
