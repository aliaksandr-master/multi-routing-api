import Method from './Method';
import { assertTrimmedNonEmptyString } from './assert';



export default class Resource {
  constructor (urlMack, opts = null, origin) {
    if (!origin instanceof Origin) {
      throw new Error('origin is not instance of Origin');
    }

    assertTrimmedNonEmptyString('urlMack', urlMack);

    if (origin.isWebResource && (/^https?:\/\//.test(urlMack) || /[?#]/.test(urlMack))) {
      throw new Error('url mack has invalid parts');
    }

    this.options = parseOpts(opts, origin.options);

    this.requestUrl = new RequestUrl(baseUrl, urlMack);
  }

  method (method, argsToOpts, processResponse) {

    return new Method(method, argsToOpts, processResponse, this);
  }
}
