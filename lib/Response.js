import { isNumber } from './utils';


export default class Response {
  constructor ({ ok, status, result, rawResponse = null, options = {} }) {
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

    this.ok = Boolean(ok);
    this.status = Number(status);
    this.result = result;
    this.options = options;
    this.rawResponse = rawResponse;
  }
}
