import { assertTrimmedNonEmptyString } from './assert';
import Resource from './Resource';
import parseOpts from './parseOpts';


export default class Origin {
  constructor ({ webResource = true, baseUrl = '', ...opts }) {
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
    }

    this.isWebResource = webResource;
    this.baseUrl = baseUrl;
    this.options = parseOpts(opts);
  }

  resource (urlMack, opts) {
    return new Resource(urlMack, opts, this);
  }
}
