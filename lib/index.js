import Transport from './Transport';
import Response from './Response';
import Origin from './Origin';
import TransportJSON from './TransportJSON';
import TransportLocalForage from './TransportLocalForage';



const origin = (options) => new Origin(options);


export {
  origin,
  Transport,
  TransportJSON,
  Response,
  TransportLocalForage
};
