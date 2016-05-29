const _               = require('underscore');
const combineReducers = require('redux').combineReducers;
const update          = require('react-addons-update');

const Constants = require('../../shared/constants');

module.exports = combineReducers({
  createMode,
  columns,
  references,
  tableDisplayName,
  models
});

function tableDisplayName(state = '', { type, tableDisplayName }) {
  if (type === 'CHANGE_TABLE_DISPLAY_NAME') {
    return tableDisplayName;
  }
  return state;
}

function columns(state = [], {type, index, columnDisplayName, columnType}) {
  if (type === 'ADD_COLUMN') {
    return update(state, { $push: [emptyColumn()] });
  } else if(type === 'CHANGE_COLUMN_DISPLAY_NAME') {
    return update(state, {
      [index]: { displayName: { $set: columnDisplayName } }
    });
  } else if (type === 'CHANGE_COLUMN_TYPE') {
    return update(state, {
      [index]: { type: { $set: columnType} }
    })
  }
  return state;
}

function createMode(state = true) {
  return state;
}

function models(state = []) {
  return state;
}

function references(state = [], params) {
  const {
    type,
    model,
    index,
    displayName,
    foreignDisplayName
  } = params;

  if (type === 'CLICK_REFERENCE_TAG') {
    const refIndex = _.findIndex(state, (r) => model.name === r.table);
    if (refIndex !== -1) {
      return update(state, {
        $splice: [[refIndex, 1]]
      });
    } else {
      const reference = {
        table: model.name
      };
      return update(state, {
        $push: [reference]
      });
    }
  } else if (type === 'CHANGE_REFERENCE_TABLE_DISPLAY_NAME') {
    return update(state, {
      [index]: {
        displayName: { $set: displayName }
      }
    });
  } else if (type === 'CHANGE_REFERENCE_FOREIGN_TABLE_DISPLAY_NAME') {
    return update(state, {
      [index]: {
        foreignDisplayName: { $set: foreignDisplayName }
      }
    });
  }

  return state;
}

function emptyColumn() {
  return {
    displayName: '',
    name: ''
  }
}
