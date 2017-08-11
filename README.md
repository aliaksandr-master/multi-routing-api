[![npm](http://img.shields.io/npm/v/multi-routing-api.svg?style=flat-square)](https://www.npmjs.com/package/multi-routing-api)
[![npm](http://img.shields.io/npm/l/multi-routing-api.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Dependency Status](https://david-dm.org/aliaksandr-master/multi-routing-api.svg?style=flat-square)](https://david-dm.org/aliaksandr-master/multi-routing-api)
[![devDependency Status](https://david-dm.org/aliaksandr-master/multi-routing-api/dev-status.svg?style=flat-square)](https://david-dm.org/aliaksandr-master/multi-routing-api#info=devDependencies)

# multi-routing-api
Predictable fetch for redux.
Used normalizr.

```shell
$ npm install multi-routing-api --save
```

```js
// main-api.origins.js
import { ResourceOrigin, TransportJSON } from 'multi-routing-api';



export const mainResource = ResourceOrigin({
  baseUrl: `${window.location.protocol}//${window.location.host}/api/`,
  defaultTransport: new TransportJSON()
});

```

```js
// main-api.entities.js
import { schema } from 'multi-routing-api';


export const EntitySandboxComponent = new schema.Entity('sandbox_component');
```

```js
// resource/components.js
import { EntitySandboxComponent } from '../main-api.entities';
import { mainResource } from '../main-api.origins';



export const resource = mainResource('/components', {}, { responseSchema: [ EntitySandboxComponent ] });



export const getUiAllComponentsAction = resource('GET');
```
