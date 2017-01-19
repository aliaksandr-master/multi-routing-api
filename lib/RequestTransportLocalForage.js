import 'whatwg-fetch';
import TransportResponse from './Response';
import Transport from './RequestTransport';
import localforage from 'localforage';



export default class TransportLocalForage extends Transport {

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
          return new TransportResponse({ result: null, ok: false, status: 404, statusText: 'Not Found' });
        }

        return new TransportResponse({ result, ok: true, status: 200, statusText: 'Ok' });
      });
  }

  POST (address, data, options) {
    return Promise.resolve(localforage.setItem(address, data))
      .then(() => new TransportResponse({ result: data, ok: true, status: 201, statusText: 'Ok' }));
  }

  PUT (address, data, options) {
    return Promise.resolve(localforage.getItem(address))
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new TransportResponse({ result: null, ok: false, status: 404, statusText: 'Not Found' }));
        }

        return Promise.resolve(localforage.setItem(address, data))
          .then(() => new TransportResponse({ result: data, ok: true, status: 201, statusText: 'Ok' }));
      });
  }

  PATCH (address, data, options) {
    return Promise.resolve(localforage.getItem(address))
      .then((itemData) => {
        if (itemData === null) {
          return Promise.resolve(new TransportResponse({ result: null, ok: false, status: 404, statusText: 'Not Found' }));
        }

        const resultData = { ...(itemData || {}), ...data };

        return Promise.resolve(localforage.setItem(address, { ...resultData }))
          .then(() => new TransportResponse({ result: resultData, ok: true, status: 201, statusText: 'Ok' }));
      });
  }

  DELETE (address, data, options) {
    return Promise.resolve(localforage.removeItem(address))
      .then(() => new TransportResponse({ result: null, ok: true, status: 200, statusText: 'Ok' }));
  }
}
