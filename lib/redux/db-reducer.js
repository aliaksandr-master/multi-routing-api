import { merge } from '../utils';


const DB_COLLECT_ENTITIES = '@DB_COLLECT_ENTITIES';




export const fetchEntitiesAction = (entities) => ({
  type: DB_COLLECT_ENTITIES,
  payload: { entities }
});




const initialState = {};

export const reducer = (state = initialState, action) => {
  if (action.type === DB_COLLECT_ENTITIES) {
    state = merge({}, state, action.payload.entities);
  }

  return state;
};
