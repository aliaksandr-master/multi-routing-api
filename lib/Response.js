import { isNumber } from './utils';


export default class Response {
  constructor (params) {
    const { ok, status, result, rawResponse = null } = params;

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

    Object.assign(this, params);

    this.rawResponse = rawResponse;
    this.status = Number(status);
    this.ok = Boolean(ok);
  }
}
