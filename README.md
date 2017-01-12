[![npm](http://img.shields.io/npm/v/redux-routed-api-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-routed-api-middleware)
[![npm](http://img.shields.io/npm/l/redux-routed-api-middleware.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/aliaksandr-master/redux-routed-api-middleware.svg?style=flat-square)](https://david-dm.org/aliaksandr-master/redux-routed-api-middleware)
[![devDependency Status](https://david-dm.org/aliaksandr-master/redux-routed-api-middleware/dev-status.svg?style=flat-square)](https://david-dm.org/aliaksandr-master/redux-routed-api-middleware#info=devDependencies)

# redux-routed-api-middleware
Predictable fetch for redux.
Used normalizr.

```shell
$ npm install redux-routed-api-middleware --save
```

```js
// main-api.origins.js
import { ResourceOrigin, TransportJSON } from 'redux-routed-api-middleware';



export const mainResource = ResourceOrigin({
  baseUrl: `${window.location.protocol}//${window.location.host}/api/`,
  defaultTransport: new TransportJSON()
});

```

```js
// main-api.entities.js
import { schema } from 'redux-routed-api-middleware';


export const EntitySandboxComponent = new schema.Entity('sandbox_component');
```

```js
// resource/components.js
import { EntitySandboxComponent } from '../main-api.entities';
import { mainResource } from '../main-api.origins';



export const resource = mainResource('/components', {}, { responseSchema: [ EntitySandboxComponent ] });



export const getUiAllComponentsAction = resource('GET');
```
