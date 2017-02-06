import Response from './Response';
import { cloneDeep } from './utils';



export default class Cache {
  constructor (transport, settings) {
    this.transport = transport;
    this.settings = settings;
  }

  makeHash (method, address, data, options) {
    return `${method}${address}`;
  }

  get (hash) {
    return this.transport.request('GET', hash)
      .then((response) => {
        if (response.ok) {
          return response.result;
        }

        return Promise.reject();
      });
  }

  clear (hash) {
    return this.transport.request('DELETE', hash);
  }

  set (hash, promise) {
    return promise.then((response) =>
      this.transport.request('POST', hash, response)
        .then((response) => {
          if (response.ok) {
            return response.result;
          }

          return Promise.reject();
        }));
  }
}
