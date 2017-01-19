import Transport from './RequestTransport';
import Response from './Response';
import RequestUrl from './RequestUrl';
import {
  assertFunction,
  assertInstanceOf,
  assertPlainObject,
  assertTrimmedNonEmptyString
} from './assert';



let counter = 0;
const calcRequestId = () => `request-${++counter}`;



const splitResponseByOk = (response) => {
  if (response instanceof Response) {
    return response.ok ? response : Promise.reject(response);
  }

  throw new Error('invalid response type. must be Response');
};






const parseOpts = (opts = {}, prevOpts) => {
  const {
    data = prevOpts.data,
    params = {}, // for merging. set param as undefined if you want to remove it from url
    notifyBegin = prevOpts.notifyBegin || null,
    notifyEnd = prevOpts.notifyEnd || null,
    transport = prevOpts.transport || null,
    ...options
  } = opts;


  assertPlainObject('params', params);

  if (transport !== null) {
    assertInstanceOf(Transport, 'transport', transport);
  }

  if (notifyBegin !== null) {
    assertFunction('notifyBegin', notifyBegin);
  }

  if (notifyEnd !== null) {
    assertFunction('notifyEnd', notifyEnd);
  }


  return {
    data,
    params: { ...prevOpts.params, ...params },
    notifyBegin,
    notifyEnd,
    transport,
    options
  };
};



export default ({ webResource = true, baseUrl = '' }, opts) => {
  if (process.env.NODE_ENV !== 'production') {
    if (webResource !== true && webResource !== false) {
      throw new TypeError('webResource has not Boolean type');
    }

    if (webResource) {
      assertTrimmedNonEmptyString('baseUrl', baseUrl);

      if (!/^https?:\/\//.test(baseUrl)) {
        throw new Error(`base url must have url-schema http/https. "${baseUrl}" given`);
      }

      if (/[?#]/.test(baseUrl)) {
        throw new Error('base url has invalid parts');
      }
    }
  }

  const originOpts = parseOpts(opts, { params: {} });

  return {
    resource: (urlMack, opts) => {
      if (process.env.NODE_ENV !== 'production') {
        assertTrimmedNonEmptyString('urlMack', urlMack);

        if (webResource && (/^https?:\/\//.test(urlMack) || /[?#]/.test(urlMack))) {
          throw new Error('url mack has invalid parts');
        }
      }

      const resourceOpts = parseOpts(opts, originOpts);

      const requestUrl = new RequestUrl(baseUrl, urlMack);

      return {
        method: (method, opts = {}, argsToOpts = () => ({})) => {
          const methodOpts = parseOpts(opts, resourceOpts);

          assertFunction('argsToProps', argsToOpts);

          return {
            request: (...args) => {
              const { params, notifyBegin, notifyEnd, data, transport, options } = parseOpts(argsToOpts(...args), methodOpts);
              const url = requestUrl.format(params);
              const requestOptions = {
                ...options,
                requestId: calcRequestId(),
                requestURL: url,
                requestMethod: method
              };

              notifyBegin(requestOptions);

              return transport.request(method, url, data, requestOptions)
                .then(splitResponseByOk)
                .then(
                  (response) => {
                    notifyEnd(requestOptions, response);

                    return response;
                  },
                  (response) => {
                    notifyEnd(requestOptions, response);

                    return Promise.reject(response);
                  });
            }
          };
        }
      };
    }
  };
};
