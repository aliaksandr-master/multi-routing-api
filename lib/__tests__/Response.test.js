/* eslint-env browser, jest */

import Response from '../Response';


describe('Response', () => {
  it('need to throw if passed invalid params', () => {
    expect(() => {
      const transport = new Response();
    }).toThrow();

    expect(() => {
      const transport = new Response({});
    }).toThrow();

    expect(() => {
      const transport = new Response({ result: null });
    }).toThrow();

    expect(() => {
      const transport = new Response({ ok: false, result: null });
    }).toThrow();
  });

  it('should set needable props', () => {
    const transport = new Response({ ok: false, result: null, status: 404 });

    expect(transport).toMatchSnapshot();
  });
});
