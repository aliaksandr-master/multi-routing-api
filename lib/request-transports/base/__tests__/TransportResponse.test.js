/* eslint-env browser, jest */

import TransportResponse from '../TransportResponse';


describe('TransportResponse', () => {
  it('need to throw if passed invalid params', () => {
    expect(() => {
      const transport = new TransportResponse();
    }).toThrow();

    expect(() => {
      const transport = new TransportResponse({});
    }).toThrow();

    expect(() => {
      const transport = new TransportResponse({ result: null });
    }).toThrow();

    expect(() => {
      const transport = new TransportResponse({ ok: false, result: null });
    }).toThrow();
  });

  it('should set needable props', () => {
    const transport = new TransportResponse({ ok: false, result: null, status: 404 });

    expect(transport).toEqual({ ok: false, statusText: 'Ooops', result: null, status: 404 });
  });
});
