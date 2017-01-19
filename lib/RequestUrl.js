import { addSearchToUrl, joinUrlPaths, isString, reduce, isNumber, isNaN } from './utils';
import {
  assertUniq
} from './assert';



let counter = 0;


class RequestUrl {
  constructor (base, rawMask) {
    rawMask = joinUrlPaths(base, rawMask);

    this.params = [];
    this.paramsByName = {};
    this.maskedUrlPath = rawMask.replace(/:([a-zA-Z][a-zA-Z0-9_$]*)/g, ($0, name) => {
      const mask = `<{{${counter++}}}>`;
      const maskParam = { mask, name };

      this.params.push(maskParam);
      this.paramsByName[name] = maskParam;

      return mask;
    });


    if (process.env.NODE_ENV !== 'production') {
      assertUniq('url mask params', this.params.map(({ name }) => name));
    }
  }

  format (params) {
    let url = this.params.reduce((url, { mask, name }) => {
      if (params.hasOwnProperty(name)) {
        const value = params[name];

        if (!(isNumber(value) && !isNaN(value)) && !(isString(value) && value)) {
          throw new Error(`params[${name}] must be non-empty string or number`);
        }

        return url.replace(mask, value);
      }

      throw new Error(`empty param "${name}" in urlMask "${mask}"`);
    }, this.maskedUrlPath);



    const search = reduce(params, (search, paramValue, paramName) => {
      if (this.paramsByName.hasOwnProperty(paramName)) {
        return search;
      }

      if (paramValue !== undefined) {
        search[paramName] = paramValue;
      }

      return search;
    }, {});



    if (search) {
      url = addSearchToUrl(url, search);
    }



    return url;
  }
}


export default RequestUrl;
