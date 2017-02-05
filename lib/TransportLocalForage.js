import Response from './Response';
import Transport from './Transport';
import localforage from 'localforage';
import { isFunction } from './utils';



export default class TransportLocalForage extends Transport {

  request (method, address, data, options) {
    if (isFunction(this[method])) {
      return this[method](address, data, options);
    }

    throw new Error(`unsupported method ${method}`);
  }

  HEAD (address, data, options) {
    return this.GET(address, data, options)
      .then((response) => {
        response.result = null;

        return response;
      });
  }

  GET (address, data, options) {
    return Promise.resolve(localforage.getItem(address))
      .then((result) => {
        if (result === null) {
          return new Response({ result: null, ok: false, status: 404, statusText: 'Not Found' });
        }

        return new Response({ result, ok: true, status: 200, statusText: 'Ok' });
      });
  }

  POST (address, data, options) {
    return Promise.resolve(localforage.setItem(address, data))
      .then(() => new Response({ result: data, ok: true, status: 201, statusText: 'Ok' }));
  }

  PUT (address, data, options) {
    return Promise.resolve(localforage.getItem(address))
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new Response({ result: null, ok: false, status: 404, statusText: 'Not Found' }));
        }

        return Promise.resolve(localforage.setItem(address, data))
          .then(() => new Response({ result: data, ok: true, status: 201, statusText: 'Ok' }));
      });
  }

  PATCH (address, data, options) {
    return Promise.resolve(localforage.getItem(address))
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new Response({ result: null, ok: false, status: 404, statusText: 'Not Found' }));
        }

        const resultData = { ...(itemData || {}), ...data };

        return Promise.resolve(localforage.setItem(address, { ...resultData }))
          .then(() => new Response({ result: resultData, ok: true, status: 201, statusText: 'Ok' }));
      });
  }

  DELETE (address, data, options) {
    return Promise.resolve(localforage.removeItem(address))
      .then(() => new Response({ result: null, ok: true, status: 200, statusText: 'Ok' }));
  }
}
