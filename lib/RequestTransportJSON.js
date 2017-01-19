/* eslint-env browser */

import 'whatwg-fetch';
import Response from './Response';
import RequestTransport from './RequestTransport';
import { reduce } from './utils';


const HEADER_CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';


export default class RequestTransportJSON extends RequestTransport {

  HEAD (address, data, options) {
    return this._request('HEAD', address, data, options);
  }

  GET (address, data, options) {
    return this._request('GET', address, data, options);
  }

  PUT (address, data, options) {
    return this._request('PUT', address, data, options);
  }

  PATCH (address, data, options) {
    return this._request('PATCH', address, data, options);
  }

  POST (address, data, options) {
    return this._request('POST', address, data, options);
  }

  DELETE (address, data, options) {
    return this._request('DELETE', address, data, options);
  }

  _request (method, address, data, options = {}) {
    const fetchOptions = {
      ...options,
      headers: {
        ...(options.headers || {})
      },
      method
    };

    delete fetchOptions.body;

    if (!fetchOptions.headers.hasOwnProperty('Accept')) {
      fetchOptions.headers.Accept = APPLICATION_JSON;
    }

    if ([ 'POST', 'PUT', 'PATCH' ].includes(fetchOptions.method)) {
      if (!fetchOptions.headers.hasOwnProperty(HEADER_CONTENT_TYPE)) {
        fetchOptions.headers[HEADER_CONTENT_TYPE] = APPLICATION_JSON;
      }

      if (fetchOptions.headers[HEADER_CONTENT_TYPE] === APPLICATION_JSON) {
        fetchOptions.body = JSON.stringify(data);
      }
    }

    fetchOptions.headers = reduce(fetchOptions.headers, (headers, value, key) => {
      headers.append(key, value);

      return headers;
    }, new Headers());

    return fetch(address, fetchOptions)
      .then((response) => {
        if (response.headers.get('Content-Length') === '0') {
          return { response, result: null };
        }

        return response.json()
          .then((result) => ({ response, result }));
      })
      .then(
        ({ response, result }) =>
          new Response({ result, ok: response.ok, status: response.status, rawResponse: response })
      );
  }
}
