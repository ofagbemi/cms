const _        = require('underscore');
const React    = require('react');
const update   = require('react-addons-update');
const util     = require('../../shared/util');

module.exports = {
  // columns
  addColumn() {
    return {
      type: 'ADD_COLUMN'
    };
  },
  changeColumnDisplayName({ index, columnDisplayName }) {
    return {
      type: 'CHANGE_COLUMN_DISPLAY_NAME',
      index,
      columnDisplayName
    }
  },
  changeColumnType({ index, columnType }) {
    return {
      type: 'CHANGE_COLUMN_TYPE',
      index,
      columnType
    };
  },
  changeTableDisplayName(tableDisplayName) {
    return {
      type: 'CHANGE_TABLE_DISPLAY_NAME',
      tableDisplayName
    };
  },

  // references
  clickReferenceTag({ index, model }) {
    return {
      type: 'CLICK_REFERENCE_TAG',
      index,
      model
    };
  },
  changeReferenceTableDisplayName({ index, displayName }) {
    return {
      type: 'CHANGE_REFERENCE_TABLE_DISPLAY_NAME',
      index,
      displayName
    };
  },
  changeReferenceForeignTableDisplayName({ index, foreignDisplayName }) {
    return {
      type: 'CHANGE_REFERENCE_FOREIGN_TABLE_DISPLAY_NAME',
      index,
      foreignDisplayName
    };
  },
  createModel() {
    return {
      type: 'CREATE_MODEL'
    };
  },
  createModelSuccess(response) {
    return {
      type: 'CREATE_MODEL_SUCCESS',
      response
    };
  },
  createModelError(error) {
    return {
      type: 'CREATE_MODEL_ERROR',
      error
    };
  },
  createModelThunk() {

    return (dispatch, getState) => {

      const state = getState().components.createModelComponent;
      const { tableDisplayName: displayName, references } = state;
      const columns = state.columns.map((column) => {
        return _.pick(column, 'type', 'displayName');
      });

      const data = {
        displayName,
        columns,
        references
      };

      dispatch(this.createModel());

      const url = '/';
      return util.fetchJSON(url, {
        method: 'POST',
        credentials: 'same-origin',
        data: data
      })
      .then(response => response.json())
      .then((json) => {
        console.log('posted successfully', json);
        dispatch(this.createModelSuccess(json));
      }).catch((err) => {
        console.log('there was an error', err);
        dispatch(this.createModelError(err));
      });
    };
  }
};
