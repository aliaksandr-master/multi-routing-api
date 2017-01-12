import fetchJSONP from 'fetch-jsonp';
import Transport from './base/Transport';




export default class TransportJSONP extends Transport {
  request (method, address, data, apiAction) {
    return fetchJSONP(address);
  }
}
