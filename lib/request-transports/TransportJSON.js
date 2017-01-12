import 'whatwg-fetch';
import TransportResponse from './base/TransportResponse';
import Transport from './base/Transport';


const HEADER_CONTENT_TYPE = 'Content-Type';
const APPLICATION_JSON = 'application/json';


export default class TransportJSON extends Transport {
  request (method, url, data, apiAction) {
    const fetchOptions = {
      ...(apiAction.transportOptions || {}),
      headers: {
        ...(apiAction.headers || {})
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

    fetchOptions.method = String(fetchOptions.method || '').toUpperCase();

    return window.fetch(url, fetchOptions)
      .then((response) => {
        if (response.headers.get('Content-Length') === '0') {
          return { response, result: null };
        }

        return response.json().then((result) => ({ response, result }));
      })
      .then(
        ({ response: { status, statusText, ok }, result }) => new TransportResponse({ result, ok, status, statusText })
      );
  }
}
