import isFunction from 'lodash/isFunction';




export default class Transport {

  HEAD (address, data, options) {
    throw new Error('method HEAD is unsupported for this transport type');
  }

  GET (address, data, options) {
    throw new Error('method GET is unsupported for this transport type');
  }

  PUT (address, data, options) {
    throw new Error('method PUT is unsupported for this transport type');
  }

  PATCH (address, data, options) {
    throw new Error('method PATCH is unsupported for this transport type');
  }

  POST (address, data, options) {
    throw new Error('method POST is unsupported for this transport type');
  }

  DELETE (address, data, options) {
    throw new Error('method DELETE is unsupported for this transport type');
  }

  constructor (settings = {}) {
    this.settings = settings;
  }

  request (method, address, data, options) {
    if (isFunction(this[method])) {
      return this[method](address, data, options);
    }

    throw new Error(`unsupported method ${method}`);
  }
}
