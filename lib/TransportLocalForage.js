import Response from './Response';
import Transport from './Transport';
import localforage from 'localforage';
import { isFunction } from './utils';



const hooks = [];

export default class TransportLocalForage extends Transport {
  constructor (...args) {
    super(...args);

    this._connection = this.connect(...args);
  }

  static addHook ({ testFunc, responseFunc }) {
    if (!isFunction(testFunc)) {
      throw new TypeError('testFunc is not a function');
    }

    if (!isFunction(responseFunc)) {
      throw new TypeError('responseFunc is not a function');
    }

    hooks.push({ testFunc, responseFunc });
  }

  storageGet (address) {
    return Promise.resolve(this._connection.getItem(this.prepareStorageAddress(address))).then((result = null) => result);
  }

  storageSet (address, data) {
    return Promise.resolve(this._connection.setItem(this.prepareStorageAddress(address), data));
  }

  storageUnset (address) {
    return Promise.resolve(this._connection.removeItem(this.prepareStorageAddress(address)));
  }

  prepareStorageAddress (address) {
    return address;
  }

  connect ({ localforage: { name = 'routed-api', ...other } = {} } = {}) {
    return localforage.createInstance({ name, ...other });
  }

  request (method, address, data, options) {
    const hook = hooks.find(({ testFunc }) => testFunc(method, address, data, options));

    if (hook) {
      return hook.responseFunc(method, address, data, options);
    }

    if (isFunction(this[method])) {
      return this[method](address, data, options);
    }

    throw new Error(`routed-api TransportLocalForage: unsupported method ${method}`);
  }

  HEAD (address, data, options) {
    return this.GET(address, data, options)
      .then((response) => {
        response.result = null;

        return response;
      });
  }

  GET (address, data, options) {
    return this.storageGet(address)
      .then((result) => {
        if (result === null) {
          return new Response({ result: null, ok: false, status: 404, statusText: 'Not Found', options });
        }

        return new Response({ result, ok: true, status: 200, statusText: 'Ok', options });
      });
  }

  POST (address, data, options) {
    return this.storageSet(address, data)
      .then(() => new Response({ result: data, ok: true, status: 201, statusText: 'Ok', options }));
  }

  PUT (address, data, options) {
    return this.storageGet(address)
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new Response({ result: null, ok: false, status: 404, statusText: 'Not Found', options }));
        }

        return this.storageSet(address, data)
          .then(() => new Response({ result: data, ok: true, status: 201, statusText: 'Ok', options }));
      });
  }

  PATCH (address, data, options) {
    return this.storageGet(address)
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new Response({ result: null, ok: false, status: 404, statusText: 'Not Found', options }));
        }

        const resultData = { ...(itemData || {}), ...data };

        return this.storageSet(address, { ...resultData })
          .then(() => new Response({ result: resultData, ok: true, status: 201, statusText: 'Ok', options }));
      });
  }

  DELETE (address, data, options) {
    return this.storageUnset(address)
      .then(() => new Response({ result: null, ok: true, status: 200, statusText: 'Ok', options }));
  }
}
