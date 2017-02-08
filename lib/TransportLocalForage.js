import Response from './Response';
import Transport from './Transport';
import localforage from 'localforage';
import { isFunction } from './utils';



const get = (address) => Promise.resolve(localforage.getItem(address));
const set = (address, data) => Promise.resolve(localforage.setItem(address, data));
const remove = (address) => Promise.resolve(localforage.removeItem(address));



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
    return get(address)
      .then((result) => {
        if (result === null) {
          return new Response({ result: null, ok: false, status: 404, statusText: 'Not Found', options });
        }

        return new Response({ result, ok: true, status: 200, statusText: 'Ok', options });
      });
  }

  POST (address, data, options) {
    return set(address, data)
      .then(() => new Response({ result: data, ok: true, status: 201, statusText: 'Ok', options }));
  }

  PUT (address, data, options) {
    return get(address)
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new Response({ result: null, ok: false, status: 404, statusText: 'Not Found', options }));
        }

        return set(address, data)
          .then(() => new Response({ result: data, ok: true, status: 201, statusText: 'Ok', options }));
      });
  }

  PATCH (address, data, options) {
    return get(address)
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new Response({ result: null, ok: false, status: 404, statusText: 'Not Found', options }));
        }

        const resultData = { ...(itemData || {}), ...data };

        return set(address, { ...resultData })
          .then(() => new Response({ result: resultData, ok: true, status: 201, statusText: 'Ok', options }));
      });
  }

  DELETE (address, data, options) {
    return remove(address)
      .then(() => new Response({ result: null, ok: true, status: 200, statusText: 'Ok', options }));
  }
}
