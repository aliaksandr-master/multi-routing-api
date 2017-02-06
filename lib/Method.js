import { assertFunction } from './assert';
import parseOpts from './parseOpts';
import Response from './Response';
import { cloneDeep } from './utils';



let counter = 0;



export default class Method {
  constructor (method, mapArgs = null, processResponse = null, resource) {
    this.method = method;
    this.options = resource.options;
    this.requestUrl = resource.requestUrl;
    this.id = ++counter;

    if (mapArgs !== null) {
      assertFunction('argsToProps', mapArgs);
    } else {
      mapArgs = (params = {}, data, options = {}) => ({ params, data, ...options });
    }

    this._mapArgs = mapArgs;

    if (processResponse !== null) {
      assertFunction('processResponse', processResponse);
    } else {
      processResponse = (response) => response;
    }

    this._processResponse = processResponse;
    this.requestCounter = 0;
  }

  calcRequestId () {
    return `request-${this.id}-${++this.requestCounter}`;
  }

  _remoteCall (transport, method, address, data, options, notifyBegin, notifyEnd) {
    notifyBegin && notifyBegin({ options });

    return transport.request(method, address, data, options)
      .then((response) => {
        response.options = options;

        return response;
      })
      .then(this._processResponse)
      .then((response) => {
        if (response instanceof Response) {
          return response.ok ? response : Promise.reject(response);
        }

        throw new Error('invalid response type. must be Response');
      })
      .then(
        (response) => {
          notifyEnd && notifyEnd(response);

          return response;
        },
        (response) => {
          notifyEnd && notifyEnd(response);

          return Promise.reject(response);
        }
      );
  }

  _cacheCall (transport, method, address, data, options, notifyBegin, notifyEnd) {
    const key = cache.makeKey(method, address, data, options);

    return cache.get(key)
      .then(
        (response) => new Response(cloneDeep(response)),
        () =>
          this._remoteCall(transport, method, address, data, options, notifyBegin, notifyEnd)
            .then(
              (response) => cache.set(key, response),
              (response) => {
                if (response instanceof Response) {
                  return Promise.resolve(cache.set(key, response))
                    .then(() => Promise.reject(response));
                }

                return response;
              }
            )
      );
  }

  request (...args) {
    const { params, cache, notifyBegin, notifyEnd, data, transport, options } = parseOpts(this._mapArgs(...args), this.options);
    const url = this.requestUrl.format(params);
    const requestOptions = {
      ...options,
      requestId: this.calcRequestId(),
      requestURL: url,
      requestData: data,
      requestMethod: method,
      requestParams: params
    };

    const request = () =>
      this._remoteCall(transport, method, url, data, requestOptions, notifyBegin, notifyEnd);

    if (cache) {
      const hash = cache.makeHash(method, url, data, requestOptions);

      if (hash) {
        cache.get(hash)
          .then(
            (response) => new Response(cloneDeep(response)),
            () =>
              request()
                .then(
                  (response) => cache.set(key, response),
                  (response) => {
                    if (response instanceof Response) {
                      return Promise.resolve(cache.set(key, response))
                        .then(() => response, () => response);
                    }

                    return response;
                  }
                )
          );
      }
    }

    return request();
  }
}
