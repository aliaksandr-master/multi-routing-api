const getEntityById = (dbTable, id) =>
  dbTable.hasOwnProperty(id) ? dbTable[id] : null;




export default (schema, db, value) => {
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
