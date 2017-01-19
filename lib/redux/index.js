import { schema, normalize } from 'normalizr';
import { reducer } from './db-reducer';
import middleware from './db-middleware';
import denormalize from './db-denormalize';


export {
  schema,
  reducer,
  normalize,
  middleware,
  denormalize
};
