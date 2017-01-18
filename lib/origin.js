import uniq from 'lodash/uniq';
import each from 'lodash/each';
import values from 'lodash/values';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import Transport from './request-transports/base/Transport';
import { schema as normalizrSchema } from 'normalizr';
import URI from 'urijs';
import usymbol from 'usymbol';
import { NOTIFIER_DONE, NOTIFIER_FAIL, NOTIFIER_PENDING } from './fetch-middleware';
import {
  assertUniq,
  assertInstanceOf,
  assertPlainObject,
  assertAvailableValues,
  assertAvailableProps,
  assertFunction,
  assertTrimmedNonEmptyString
} from './assert';




const avlMethods = [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD' ];
const avlInterceptorNames = [ NOTIFIER_DONE, NOTIFIER_FAIL, NOTIFIER_PENDING ];





const assertNotifiers = (notifiers) => {
  Object.keys(notifiers)
    .forEach((value) => notifiers[value] === null || assertFunction(`interceptor ${value}`, notifiers[value]));
};



export default ({ baseUrl = '', webResource = true, defaultTransport, notifiers = {} }) => {
  if (process.env.NODE_ENV !== 'production') {
    if (webResource !== true && webResource !== false) {
      throw new TypeError('webResource has not Boolean type');
    }

    if (webResource) {
      assertTrimmedNonEmptyString('baseUrl', baseUrl);

      if (!/^https?:\/\//.test(baseUrl)) {
        throw new Error(`base url must have url-schema http/https. "${baseUrl}" given`);
      }

      if (/[?#]/.test(baseUrl)) {
        throw new Error('base url has invalid parts');
      }
    }

    assertNotifiers(notifiers);
    assertPlainObject('notifiers', notifiers);
    assertAvailableProps(avlInterceptorNames, 'notifiers', notifiers);
  }




  const defaultNotifiers = notifiers;




  return {
    resource: (urlMack, defaultURLAndQueryParams = {}, { schema = null, transport = defaultTransport, notifiers = {} } = {}) => {
      if (process.env.NODE_ENV !== 'production') {
        assertTrimmedNonEmptyString('urlMack', urlMack);
        assertPlainObject('defaultURLAndQueryParams', defaultURLAndQueryParams);

        if (schema) {
          if (Array.isArray(schema)) {
            if (schema.length !== 1) {
              throw new Error('invalid schema array format');
            }
            assertInstanceOf(values(normalizrSchema), 'schema', schema[0]);
          } else {
            assertInstanceOf(values(normalizrSchema), 'schema', schema);
          }
        }

        assertInstanceOf(Transport, 'transport', transport);

        if (webResource && (/^https?:\/\//.test(urlMack) || /[?#]/.test(urlMack))) {
          throw new Error('url mack has invalid parts');
        }

        assertNotifiers(notifiers);
        assertPlainObject('notifiers', notifiers);
        assertAvailableProps(avlInterceptorNames, 'notifiers', notifiers);
      }


      const resourceNotifiers = { ...defaultNotifiers, ...notifiers };


      const urlMaskParams = [];

      urlMack = `${String(baseUrl || '').replace(/\/$/, '')}/${urlMack.trim().replace(/^\//, '')}`;

      urlMack.replace(/<([a-z0-9_]+)>/gi, ($0, $1) => {
        urlMaskParams.push({ mask: $0, name: $1 });
      });

      const urlMaskParamNames = urlMaskParams.map(({ name }) => name);


      if (process.env.NODE_ENV !== 'production') {
        assertUniq('url mask params', urlMaskParamNames);
      }


      const availableParams = uniq(Object.keys(defaultURLAndQueryParams).concat(urlMaskParamNames));
      const queryParams = availableParams.filter((name) => !urlMaskParamNames.includes(name));


      if (process.env.NODE_ENV !== 'production') {
        each(defaultURLAndQueryParams, (value, key) => {
          if (urlMaskParamNames.includes(key)) {
            if ((isString(value) && value) || (isNumber(value) && !isNaN(value))) {
              throw new Error(`defaultURLAndQueryParams[${key}] must be non-empty string or number`);
            }
          }
        });
      }


      return {
        method: (method, prepareParams) => {
          if (process.env.NODE_ENV !== 'production') {
            assertTrimmedNonEmptyString('method', method);
            assertAvailableValues(avlMethods, 'method', method);
          }


          return {
            request: (...args) => {
              const { params = {}, notifiers = {}, data, ...otherOptions } = prepareParams ? prepareParams(...args) : {};


              if (process.env.NODE_ENV !== 'production') {
                assertAvailableProps(availableParams, 'params', params);
                assertPlainObject('params', params);
                assertNotifiers(notifiers);
                assertPlainObject('notifiers', notifiers);
                assertAvailableProps(avlInterceptorNames, 'notifiers', notifiers);
              }


              let url = urlMaskParams.reduce((url, { mask, name }) => {
                if (params.hasOwnProperty(name)) {
                  const value = params[name];

                  if (!(isNumber(value) && !isNaN(value)) && !(isString(value) && value)) {
                    throw new Error(`params[${name}] must be non-empty string or number`);
                  }

                  return url.replace(mask, value);
                }

                if (defaultURLAndQueryParams.hasOwnProperty(name)) {
                  return url.replace(mask, defaultURLAndQueryParams[name]);
                }

                throw new Error(`empty param "${name}" in urlMask "${urlMack}"`);
              }, urlMack);


              if (queryParams.length) {
                const search = queryParams.reduce((search, name) => {
                  if (params.hasOwnProperty(name)) {
                    if (params[name] !== undefined) {
                      search[name] = params[name];
                    }
                  } else if (defaultURLAndQueryParams.hasOwnProperty(name) && defaultURLAndQueryParams[name] !== undefined) {
                    search[name] = defaultURLAndQueryParams[name];
                  }

                  return search;
                }, {});

                if (search) {
                  url = URI(url).addSearch(search).toString();
                }
              }


              const options = {
                ...otherOptions,
                apiActionId: usymbol('apiActionId'),
                url,
                method,
                schema,
                notifiers: {
                  ...resourceNotifiers,
                  ...notifiers
                }
              };


              return {
                options,
                promise: transport.request(method, url, data, options)
              };
            }
          };
        }
      };
    }
  };
};
