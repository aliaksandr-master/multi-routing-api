import { normalize as normalizrNormalize, schema as normalizeSchema } from 'normalizr';
import { fetchEntitiesAction } from './db-reducer';
import { isFunction, values } from '../utils';
import { assertInstanceOf } from '../assert';



const normalize = (dispatch) => (response) => { // normalize
  if (response && response.options && response.options.schema) {
    const schema = response.options.schema;


    if (Array.isArray(schema)) {
      if (schema.length !== 1) {
        throw new Error('invalid schema array format');
      }
      assertInstanceOf(values(normalizeSchema), 'schema', schema[0]);
    } else {
      assertInstanceOf(values(normalizeSchema), 'schema', schema);
    }

    const normalized = normalizrNormalize(response.result, schema);

    dispatch(fetchEntitiesAction(normalized.entities));

    response.result = normalized.result;
  }

  return response;
};


export default () => ({ dispatch }) => (next) => (action) => {
  if (!action || !action.payload || !action.payload.hasOwnProperty('apiAction')) {
    return next(action);
  }

  const { payload: { apiAction, ...restPayload } = {}, ...restAction } = action;

  if (!isFunction(apiAction.then)) {
    throw new Error('then method of apiAction\'s result is undefined');
  }

  return next({
    ...restAction,
    payload: {
      ...restPayload,
      promise: apiAction.then(normalize(dispatch))
    }
  });
};
