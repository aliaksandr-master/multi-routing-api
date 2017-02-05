import { assertFunction } from './assert';
import parseOpts from './parseOpts';
import Response from './Response';



let counter = 0;
const calcRequestId = () => `request-${++counter}`;



const splitResponseByOk = (response) => {
  if (response instanceof Response) {
    return response.ok ? response : Promise.reject(response);
  }

  throw new Error('invalid response type. must be Response');
};




export default class Method {
  constructor (method, mapArgs = null, processResponse = null, resource) {
    this.method = method;
    this.options = resource.options;
    this.requestUrl = resource.requestUrl;

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
  }

  request (...args) {
    const { params, notifyBegin, notifyEnd, data, transport, options } = parseOpts(this._mapArgs(...args), this.options);
    const url = this.requestUrl.format(params);
    const requestOptions = {
      ...options,
      requestId: calcRequestId(),
      requestURL: url,
      requestData: data,
      requestMethod: method,
      requestParams: params
    };

    notifyBegin && notifyBegin(requestOptions);

    return transport.request(method, url, data, requestOptions)
      .then((response) => {
        response.options = requestOptions;

        return response;
      })
      .then(this._processResponse)
      .then(splitResponseByOk)
      .then(
        (response) => {
          notifyEnd && notifyEnd(requestOptions, response);

          return response;
        },
        (response) => {
          notifyEnd && notifyEnd(requestOptions, response);

          return Promise.reject(response);
        });
  }
}
