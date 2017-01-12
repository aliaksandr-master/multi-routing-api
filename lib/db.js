import merge from 'lodash/merge';



const DB_COLLECT_ENTITIES = '@DB_COLLECT_ENTITIES';




const getEntityById = (dbTable, id) =>
  dbTable.hasOwnProperty(id) ? dbTable[id] : null;




export const denormalize = (schema, db, value) => {
  if (!schema) {
    throw new Error('Schema is empty');
  }

  const key = typeof schema === 'object' ? schema.key : schema;

  if (key == null) {
    throw new Error('schema.key is empty');
  }

  if (value == null) {
    return null;
  }

  if (Array.isArray(value) && !value.length) {
    return [];
  }

  if (!db.hasOwnProperty(key)) {
    return Array.isArray(value) ? [] : null;
  }

  if (Array.isArray(value)) {
    return value.map((id) => getEntityById(db[key], id));
  }

  return getEntityById(db[key], value);
};




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
