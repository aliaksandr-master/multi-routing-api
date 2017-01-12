/* eslint-env browser, jest */

import Transport from '../Transport';


describe('Transport', () => {
  it('should throws error if child has not implemented method', () => {
    const transport = new Transport();

    expect(() => {
      transport.request();
    }).toThrow();
  });
});
