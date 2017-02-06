import { assertPlainObject, assertInstanceOf, assertFunction } from './assert';
import Transport from './Transport';
import Cache from './Cache';



export default (opts = null, prevOpts = { params: {}, options: {} }) => {
  const {
    data = prevOpts.data,
    params = {}, // for merging. set param as undefined if you want to remove it from url
    notifyBegin = prevOpts.notifyBegin || null,
    notifyEnd = prevOpts.notifyEnd || null,
    transport = prevOpts.transport || null,
    cache = prevOpts.cache || null,
    ...options
  } = opts || {};


  assertPlainObject('params', params);

  if (transport !== null) {
    assertInstanceOf(Transport, 'transport', transport);
  }

  if (cache !== null) {
    assertInstanceOf(Cache, 'cache', cache);
  }

  if (notifyBegin !== null) {
    assertFunction('notifyBegin', notifyBegin);
  }

  if (notifyEnd !== null) {
    assertFunction('notifyEnd', notifyEnd);
  }

  return {
    data,
    cache,
    params: { ...prevOpts.params, ...params },
    notifyBegin,
    notifyEnd,
    transport,
    options: { ...prevOpts.options, ...options }
  };
};
