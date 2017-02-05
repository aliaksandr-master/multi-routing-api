export default class RequestTransport {

  constructor (settings = {}) {
    this.settings = settings;
  }

  request (method, address, data, options) {
    throw new Error('request method not implemented');
  }
}
