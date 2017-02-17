import { assertTrimmedNonEmptyString, assertFunction } from './assert';
import { joinUrlPaths } from './utils';
import parseOpts from './parseOpts';
import Response from './Response';
import RequestUrl from './RequestUrl';



let counter = 0;



const splitResponseByOk = (response) => {
  if (response instanceof Response) {
    return response.ok ? response : Promise.reject(response);
  }

  throw new Error('invalid response type. must be Response');
};




export default class Resource {
  constructor (urlMack, options = null, { webResource, baseUrl }) {
    assertTrimmedNonEmptyString('urlMack', urlMack);

    this.options = options;

    if (webResource && (/^https?:\/\//.test(urlMack) || /[?#]/.test(urlMack))) {
      throw new Error('url mack has invalid parts');
    }

    this.webResource = webResource;
    this.baseUrl = baseUrl;
    this.urlMack = urlMack;

    this.requestUrl = new RequestUrl(baseUrl, urlMack);
  }

  subResource (urlMack, opts) {
    assertTrimmedNonEmptyString('urlMack', urlMack);

    const URL_TPL = /^([^?#]+)(?:\?([^#]*))?(?:#(.*))?$/;

    const pathname1 = this.urlMack.replace(URL_TPL, '$1');
    const search1 = this.urlMack.replace(URL_TPL, '$2');

    const pathname2 = urlMack.replace(URL_TPL, '$1');
    const search2 = urlMack.replace(URL_TPL, '$2');

    const pathname = joinUrlPaths(pathname1, pathname2);
    const search = `${search1}${search1 && search2 ? '&' : ''}${search2}`;

    urlMack = `${pathname}${search ? '?' : ''}${search}`;

    return new Resource(urlMack, parseOpts(opts, this.options), { webResource: this.webResource, baseUrl: this.baseUrl });
  }

  request (method, { mapArgs = null, mapResponse = null, ...options } = {}) {
    if (mapArgs !== null) {
      assertFunction('argsToProps', mapArgs);
    } else {
      mapArgs = (params = {}, data, options = {}) => ({ params, data, ...options });
    }

    const methodOptions = parseOpts(options, this.options);

    if (mapResponse !== null) {
      assertFunction('mapResponse', mapResponse);
    } else {
      mapResponse = (response) => response;
    }

    return (...args) => {
      const { params, notifyBegin, notifyEnd, data, transport, options } = parseOpts(mapArgs(...args), methodOptions);
      const address = this.requestUrl.format(params);

      options.requestID = `request-${++counter}`;
      options.requestData = data;
      options.requestMethod = method;
      options.requestParams = params;
      options.requestAddress = address;

      if (notifyBegin) {
        notifyBegin(options);
      }

      return transport.request(method, address, data, options)
        .then((response) => {
          if (!response.options) {
            response.options = options;
          }

          return response;
        })
        .then(mapResponse)
        .then(splitResponseByOk)
        .then(
          (response) => {
            if (notifyEnd) {
              notifyEnd(options, response);
            }

            return response;
          },
          (response) => {
            if (notifyEnd) {
              notifyEnd(options, response);
            }

            return Promise.reject(response);
          });
    };
  }
}
