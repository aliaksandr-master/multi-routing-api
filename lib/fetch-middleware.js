import { normalize } from 'normalizr';
import { fetchEntitiesAction } from './db';
import uSymbol from 'usymbol';




export const FetchError = class FetchError extends Error {
  constructor (response) {
    const message = response && response.result && response.result.message ? response.result.message : 'Ooops... Looks like something went wrong!';

    super(message);

    this.response = response;
  }
};



export const INTERCEPTOR_FAIL = uSymbol('INTERCEPTOR_FAIL', __filename);
export const INTERCEPTOR_DONE = uSymbol('INTERCEPTOR_DONE', __filename);
export const INTERCEPTOR_ERROR = uSymbol('INTERCEPTOR_ERROR', __filename);
export const INTERCEPTOR_PENDING = uSymbol('INTERCEPTOR_PENDING', __filename);



const notifyInterceptor = (interceptors, key, apiAction, dispatch, data = {}) => {
  if (!apiAction.interceptors || !apiAction.interceptors.hasOwnProperty(key)) {
    return;
  }

  apiAction.interceptors(apiAction, data, dispatch);
};



export default () => ({ dispatch }) => (next) => (action) => {
  if (!action.payload || !action.payload.apiAction) {
    return next(action);
  }

  const { payload: { apiAction, ...restPayload } = {}, ...restAction } = action;

  notifyInterceptor(apiAction.interceptors, INTERCEPTOR_PENDING, apiAction, dispatch);

  const promise = apiAction.transport.request(apiAction.method, apiAction.url, apiAction.data, apiAction)
    .then( // parse
      (response) => {
        if (response.ok) {
          if (typeof apiAction.parse === 'function') {
            return Promise.resolve(apiAction.parse(response.result, response))
              .then((result) => ({ ...response, result }));
          }

          return response;
        }

        if (typeof apiAction.parseError === 'function') {
          return Promise.resolve(apiAction.parseError(response.result, response))
            .then((result) => Promise.reject(new FetchError({ ...response, result })));
        }

        return Promise.reject(new FetchError(response));
      }
    )
    .then((response) => { // normalize
      if (apiAction.responseSchema) {
        const normalized = normalize(response.result, apiAction.responseSchema);

        dispatch(fetchEntitiesAction(normalized.entities));

        response.result = normalized.result;
      }

      return response;
    })
    .then( // notify
      (response) => {
        notifyInterceptor(apiAction.interceptors, INTERCEPTOR_DONE, apiAction, dispatch, response);

        return response;
      },
      (error) => {
        if (error && error instanceof FetchError) {
          notifyInterceptor(apiAction.interceptors, INTERCEPTOR_FAIL, apiAction, dispatch, error);
          return Promise.reject(error);
        }

        notifyInterceptor(apiAction.interceptors, INTERCEPTOR_ERROR, apiAction, dispatch, error);

        throw error;
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
