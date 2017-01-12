export default class TransportResponseError {
  constructor ({ result, ok, status, statusText = 'Ooops' }) {
    if (process.env.NODE_ENV !== 'production') {
      if (result === undefined) {
        throw new Error('result is not defined');
      }
      if (ok == null) {
        throw new Error('ok is undefined');
      }
      if (!status) {
        throw new Error('status is not defined');
      }
    }

    statusText = String(statusText || '');

    this.result = result;
    this.status = Number(status);
    this.statusText = statusText;
    this.ok = Boolean(ok);
  }
}
