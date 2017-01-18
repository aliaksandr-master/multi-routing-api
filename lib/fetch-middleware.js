import { normalize } from 'normalizr';
import { fetchEntitiesAction } from './db';
import uSymbol from 'usymbol';
import TransportResponse from './request-transports/base/TransportResponse';




export const FetchError = class FetchError extends Error {
  constructor (response) {
    const message = response && response.result && response.result.message ? response.result.message : 'Ooops... Looks like something went wrong!';

    super(message);

    this.response = response;
  }
};



export const NOTIFIER_FAIL = uSymbol('NOTIFIER_FAIL', __filename);
export const NOTIFIER_DONE = uSymbol('NOTIFIER_DONE', __filename);
export const NOTIFIER_PENDING = uSymbol('NOTIFIER_PENDING', __filename);



const notifyInterceptor = (notifiers, key, apiAction, dispatch, data = {}) => {
  if (!notifiers || !notifiers.hasOwnProperty(key)) {
    return;
  }

  notifiers[key](apiAction, data, dispatch);
};



export default () => ({ dispatch }) => (next) => (action) => {
  if (!action || !action.payload || !action.payload.hasOwnProperty('apiAction')) {
    return next(action);
  }

  const { payload: { apiAction, ...restPayload } = {}, ...restAction } = action;

  if (!apiAction.promise || !apiAction.promise.then) {
    throw new Error('invalid promise property of apiAction');
  }

  const options = apiAction.options;

  if (!options) {
    throw new Error('invalid options property of apiAction');
  }

  const { notifiers } = options;

  notifyInterceptor(notifiers, NOTIFIER_PENDING, options, dispatch);

  const promise = apiAction.promise
    .then((response) => { // check response
      if (response instanceof TransportResponse) {
        return response;
      }

      throw new Error('invalid response type. must be TransportResponse');
    })
    .then((response) => { // normalize
      if (options.schema) {
        const normalized = normalize(response.result, options.schema);

        dispatch(fetchEntitiesAction(normalized.entities));

        response.result = normalized.result;
      }

      return response;
    })
    .then( // notify
      (response) => {
        notifyInterceptor(notifiers, NOTIFIER_DONE, options, dispatch, response);

        return response;
      },
      (error) => {
        notifyInterceptor(notifiers, NOTIFIER_FAIL, options, dispatch, error);

        return Promise.reject(error);
      }
    );

  return next({
    ...restAction,
    payload: {
      ...restPayload,
      promise
    }
  });
};
