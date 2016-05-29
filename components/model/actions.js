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
  submit() {
    return {
      type: 'SUBMIT'
    };
  },
  submitSuccess(response) {
    return {
      type: 'SUBMIT_SUCCESS',
      response
    };
  },
  submitError(error) {
    return {
      type: 'SUBMIT_ERROR',
      error
    };
  }
};
