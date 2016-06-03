const combineReducers = require('redux').combineReducers;
const update          = require('react-addons-update');

module.exports = combineReducers({
  createMode,
  columns,
  model,
  references,
  referenceSearchBy,
  referenceSearchResults,
  isEditingReferences
});

function isEditingReferences(state = false, { type }) {
  if (type === 'SHOW_EDIT_REFERENCES') {
    return true;
  } else if (type === 'HIDE_EDIT_REFERENCES') {
    return false;
  }
  return state;
}

function createMode(state = true) {
  return state;
}

function model(state = {}) {
  return state;
}

function referenceSearchBy(state = [], { value, type, index }) {
  if (type === 'CHANGE_REFERENCE_SEARCH_BY') {
    return update(state, {
      [index]: { $set: value }
    });
  }
  return state;
}

/*
 * 2d array mapping from [index] --> [] array of row objects belonging
 * to the model
 */
function referenceSearchResults(state = [], action) {
  const {
    type,
    searchResults,
    index
  } = action;
  if (type === 'SEARCH_REFERENCE_ROWS_SUCCESS') {
    return update(state, {
      [index]: {
        $set: {
          timestamp: Date.now(),
          results: searchResults
        }
      }
    });
  } else if (type === 'SEARCH_REFERENCE_ROWS_ERROR') {

  } else if (type === 'SEARCH_REFERENCE_BEGIN') {

  }
  return state;
}

function columns(state = [], params) {
  const {
    type,
    index,
    columnValue,
    columnFiles,
    columnType
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

function references(state = {}, { type, foreignName, row }) {
  if (type === 'ADD_REFERENCE_ROW') {
    let modelState = state[foreignName] || [];
    modelState = update(modelState, {
      $push: [row]
    });

    return update(state, {
      [foreignName]: { $set: modelState }
    });
  }
  return state;
}
