import { schema, normalize, denormalize } from 'normalizr';
import { reducer } from './db-reducer';
import middleware from './db-middleware';


export {
  schema,
  reducer,
  normalize,
  middleware,
  denormalize
};
