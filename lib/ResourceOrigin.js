import isPlainObject from 'lodash/isPlainObject';
import uniq from 'lodash/uniq';
import each from 'lodash/each';
import values from 'lodash/values';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import Transport from './request-transports/base/Transport';
import { schema } from 'normalizr';
import URI from 'urijs';
import usymbol from 'usymbol';
import { INTERCEPTOR_DONE, INTERCEPTOR_ERROR, INTERCEPTOR_FAIL, INTERCEPTOR_PENDING } from './fetch-middleware';
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
const avlApiActionProps = [ 'interceptors', 'params', 'parse', 'parseError', 'data', 'headers', 'transportOptions' ];
const avlInterceptorNames = [ INTERCEPTOR_DONE, INTERCEPTOR_ERROR, INTERCEPTOR_FAIL, INTERCEPTOR_PENDING ];





const assertInterceptors = (interceptors) => {
  Object.keys(interceptors)
    .forEach((value) => interceptors[value] === null || assertFunction(`interceptor ${value}`, interceptors[value]));
};




export default ({ baseUrl, webResource = true, defaultTransport, interceptors = {} }) => {
  if (process.env.NODE_ENV !== 'production') {
    if (webResource !== true && webResource !== false) {
      throw new TypeError('webResource has not Boolean type');
    }

    assertTrimmedNonEmptyString('baseUrl', baseUrl);

    if (webResource && !/^https?:\/\//.test(baseUrl)) {
      throw new Error(`base url must have url-schema http/https. "${baseUrl}" given`);
    }

    if (webResource && /[?#]/.test(baseUrl)) {
      throw new Error('base url has invalid parts');
    }

    assertInterceptors(interceptors);
    assertPlainObject('interceptors', interceptors);
    assertAvailableProps(avlInterceptorNames, 'interceptors', interceptors);
  }




  const defaultInterceptors = interceptors;




  return (urlMack, defaultURLAndQueryParams = {}, { responseSchema = null, transport = defaultTransport, interceptors = {} } = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      assertTrimmedNonEmptyString('urlMack', urlMack);
      assertPlainObject('defaultURLAndQueryParams', defaultURLAndQueryParams);
      if (Array.isArray(responseSchema)) {
        if (responseSchema.length !== 1) {
          throw new Error('invalid responseSchema array format');
        }
        assertInstanceOf(values(schema), 'responseSchema', responseSchema[0]);
      } else {
        assertInstanceOf(values(schema), 'responseSchema', responseSchema);
      }
      assertInstanceOf(Transport, 'transport', transport);

      if (webResource && (/^https?:\/\//.test(urlMack) || /[?#]/.test(urlMack))) {
        throw new Error('url mack has invalid parts');
      }

      assertInterceptors(interceptors);
      assertPlainObject('interceptors', interceptors);
      assertAvailableProps(avlInterceptorNames, 'interceptors', interceptors);
    }




    const resourceInterceptors = { ...defaultInterceptors, ...interceptors };




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




    return (method, creator = (data) => ({ data })) => {
      if (isPlainObject(creator)) {
        const _resultApiAction = creator;

        creator = () => ({ ..._resultApiAction });
      }



      if (process.env.NODE_ENV !== 'production') {
        assertTrimmedNonEmptyString('method', method);
        assertAvailableValues(avlMethods, 'method', method);
        assertFunction('creator', creator);
      }




      return (...args) => {
        const { params = {}, interceptors = {}, ...resultApiAction } = creator(...args);



        if (process.env.NODE_ENV !== 'production') {
          assertAvailableProps(availableParams, 'params', params);
          assertPlainObject('params', params);
          assertAvailableProps(avlApiActionProps, 'api-action props (returned by creator)', resultApiAction);
          assertInterceptors(interceptors);
          assertPlainObject('interceptors', interceptors);
          assertAvailableProps(avlInterceptorNames, 'interceptors', interceptors);
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




        return {
          ...resultApiAction,
          trackingID: usymbol('trackingID'),
          url,
          method,
          transport,
          responseSchema,
          interceptors: {
            ...resourceInterceptors,
            ...interceptors
          }
        };
      };
    };
  };
};
