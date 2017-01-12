import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import uniq from 'lodash/uniq';


const getObjectType = (value) => Object.prototype.toString.call(value);
const printValue = (value) => `${getObjectType(value)}: ${JSON.stringify(value)}`;



export const assertTrimmedNonEmptyString = (name, value) => {
  if (!value || typeof value !== 'string') {
    throw new TypeError(`${name} must be non empty string, (${printValue(value)}) given`);
  }

  if (value.trim() !== value) {
    throw new Error(`${name} was not trimmed, (${printValue(value)}) given`);
  }
};

export const assertPlainObject = (name, value) => {
  if (!isPlainObject(value)) {
    throw new TypeError(`${name} must be plain object, "${getObjectType(value)}" given`);
  }
};

export const assertFunction = (name, value) => {
  if (!isFunction(value)) {
    throw new TypeError(`${name} must be function, "${getObjectType(value)}" given`);
  }
};

export const assertInstanceOf = (constructor, name, instance) => {
  if (Array.isArray(constructor) ? constructor.every((constructor) => !(instance instanceof constructor)) : !(instance instanceof constructor)) {
    throw new TypeError(`${name} has invalid type of instance`);
  }
};

export const assertUniq = (name, value) => {
  if (value.length !== uniq(value).length) {
    throw new Error(`${name} has duplicate declarations. [${value.join(',')}] given`);
  }
};

export const assertAvailableValues = (available, name, value) => {
  if (!available.includes(value)) {
    throw new Error(`${name} has invalid value [${value}]`);
  }
};

export const assertAvailableProps = (availableProps, name, value) => {
  assertPlainObject(name, value);

  Object.keys(value).forEach((val) => {
    assertAvailableValues(availableProps, name, val);
  });
};
