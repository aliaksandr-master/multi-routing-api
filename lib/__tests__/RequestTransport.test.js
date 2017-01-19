/* eslint-env browser, jest */

import RequestTransport from '../RequestTransport';


describe('RequestTransport', () => {
  it('should throws error if child has not implemented method', () => {
    const transport = new RequestTransport();

    expect(() => {
      transport.request();
    }).toThrow();
  });
});
