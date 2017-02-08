import { normalize as normalizrNormalize, schema as normalizeSchema } from 'normalizr';
import { fetchEntitiesAction } from './db-reducer';
import { isFunction, values, cloneDeep } from '../utils';
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

    return {
      ...response,
      result: normalized.result,
      rawResult: cloneDeep(response.result)
    };
  }

  return {
    ...response,
    rawResult: cloneDeep(response && response.result)
  };
};


export default () => ({ dispatch }) => (next) => (action) => {
  if (!action || !action.payload || !action.payload.hasOwnProperty('apiAction')) {
    return next(action);
  }

  const { payload: { apiAction, ...restPayload } = {}, ...restAction } = action;

  if (!isFunction(apiAction.then)) {
    throw new Error('then method of apiAction\'s result is undefined');
  }

  if (restPayload) {
    dispatch({
      ...restAction,
      payload: {
        ...restPayload
      }
    });
  }

  return next({
    ...restAction,
    payload: {
      promise: apiAction.then(normalize(dispatch))
    }
  });
};
