import { merge } from '../utils';


const DB_COLLECT_ENTITIES = '@DB_COLLECT_ENTITIES';
const DB_SET_ENTITIES = '@DB_SET_ENTITIES';




export const fetchEntitiesAction = (entities) => ({
  type: DB_COLLECT_ENTITIES,
  payload: { entities }
});

export const setEntitiesAction = (entities) => ({
  type: DB_SET_ENTITIES,
  payload: { entities }
});




const initialState = {};

export const reducer = (state = initialState, action) => {
  if (action.type === DB_COLLECT_ENTITIES) {
    state = merge({}, state, action.payload.entities);
  }

  if (action.type === DB_SET_ENTITIES) {
    state = action.payload.entities;
  }

  return state;
};
