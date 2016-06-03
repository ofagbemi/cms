const combineReducers = require('redux').combineReducers;
const update          = require('react-addons-update');

module.exports = combineReducers({
  createMode,
  columns
});

function createMode(state = true) {
  return state;
}

function columns(state = [], params) {
  const {
    type,
    index,
    columnValue,
    columnFiles
  } = params;
  if (type === 'CHANGE_COLUMN_VALUE') {
    return update(state, {
      [index]: { value: { $set: columnValue }}
    });
  } else if (type === 'CHANGE_COLUMN_FILES') {
    return update(state, {
      [index]: { files: { $set: columnFiles }}
    });
  }
  return state;
}
