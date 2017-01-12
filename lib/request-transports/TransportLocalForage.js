import 'whatwg-fetch';
import TransportResponse from './base/TransportResponse';
import Transport from './base/Transport';
import localforage from 'localforage';



export default class TransportLocalForage extends Transport {

  request (method, address, data, apiAction) {
    if (method === 'GET' || method === 'HEAD') {
      return Promise.resolve(localforage.getItem(address))
        .then((result) => {
          if (result === null) {
            return new TransportResponse({ result: null, ok: false, status: 404, statusText: 'Not Found' });
          }

          return new TransportResponse({ result, ok: true, status: 200, statusText: 'Ok' });
        });
    }

    if (method === 'POST') {
      return Promise.resolve(localforage.setItem(address, data))
        .then(() => new TransportResponse({ result: data, ok: true, status: 201, statusText: 'Ok' }));

    }

    if (method === 'PUT') {
      return Promise.resolve(localforage.getItem(address))
        .then((itemData) => {
          if (itemData === null) {
            return Promise.resolve(new TransportResponse({ result: null, ok: false, status: 404, statusText: 'Not Found' }));
          }

          return Promise.resolve(localforage.setItem(address, data))
            .then(() => new TransportResponse({ result: data, ok: true, status: 201, statusText: 'Ok' }));
        });
    }

    if (method === 'PATCH') {
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

    if (method === 'DELETE') {
      return Promise.resolve(localforage.removeItem(address))
        .then(() => new TransportResponse({ result: null, ok: true, status: 200, statusText: 'Ok' }));
    }

    throw new Error(`unsupported method ${method}`);
  }
}
