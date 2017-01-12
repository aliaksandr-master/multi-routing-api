import 'whatwg-fetch';
import TransportResponse from './base/TransportResponse';
import Transport from './base/Transport';
import localforage from 'localforage';


const dateSalt = Date.now();
const randomSalt = (Math.random() * 100000).toFixed(0);
let counter = 0;

const defaultIdBuilder = () => `${dateSalt}-${randomSalt}-${counter++}`;

export default class TransportLocalForage extends Transport {
  constructor ({ buildId = defaultIdBuilder } = {}) {
    super();

    this._buildId = buildId;
  }

  request (method, address, data, apiAction) {
    const { responseSchema } = apiAction;

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
      if (!responseSchema) {
        return Promise.resolve(localforage.setItem(address, data))
          .then(() => new TransportResponse({ result: data, ok: true, status: 201, statusText: 'Ok' }));
      }

      const id = this._buildId();

      const idAttribute = responseSchema.getIdAttribute();

      return Promise.resolve(localforage.setItem(`${address.replace(/\/+$/, '')}/${id}`, data))
        .then((result) => {
          result = {
            ...result,
            [idAttribute]: String(id)
          };

          return new TransportResponse({ result, ok: true, status: 201, statusText: 'Ok' });
        });
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
