import isString from 'lodash/isString';
import reduce from 'lodash/reduce';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import isPlainObject from 'lodash/isPlainObject';
import uniq from 'lodash/uniq';
import values from 'lodash/values';
import merge from 'lodash/merge';
import URI from 'urijs';


export const isFunction = (obj) =>
  typeof obj === 'function';


export const addSearchToUrl = (url, obj) =>
  URI(url).addSearch(obj).toString();


export const joinUrlPaths = (base, ...paths) =>
  paths.reduce((result, path) => `${result.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, base);


export {
  isNaN,
  reduce,
  merge,
  isString,
  isNumber,
  isPlainObject,
  uniq,
  values
};

