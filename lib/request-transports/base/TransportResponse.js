import isNumber from 'lodash/isNumber';


export default class TransportResponse {
  constructor ({ ok, status, result }) {
    if (process.env.NODE_ENV !== 'production') {
      if (result === undefined) {
        throw new Error('result is undefined');
      }

      if (ok !== false && ok !== true) {
        throw new Error('ok is not a boolean');
      }

      if (!isNumber(status)) {
        throw new Error('status is not a number');
      }
    }

    this.result = result;
    this.status = Number(status);
    this.ok = Boolean(ok);
  }
}
