const _    = require('underscore');
const util = require('../../shared/util');

module.exports = {
  changeColumnValue({ columnValue, index }) {
    return {
      type: 'CHANGE_COLUMN_VALUE',
      columnValue,
      index
    };
  },

  changeColumnFiles({ columnFiles, index }) {
    return {
      type: 'CHANGE_COLUMN_FILES',
      columnFiles,
      index
    };
  },

  createRow() {

    return (dispatch, getState) => {

      // begin uploading files
      dispatch(this.uploadRowFiles());
    };
  },

  createRowSuccess() {
    return {
      type: 'CREATE_ROW_SUCCESS'
    };
  },

  createRowError() {
    return {
      type: 'CREATE_ROW_ERROR'
    };
  },

  uploadRowFilesBegin() {
    return {
      type: 'UPLOAD_ROW_FILES_BEGIN'
    };
  },

  // TODO: update to use PUT request at different url
  // if not in create mode
  uploadRowFilesSuccess() {

    return (dispatch, getState) => {

      const {
        createMode,
        columns,
        model
      } = getState().components.createRowComponent;

      // TODO: only send updated columns
      const data = {};
      _.each(columns, column => {
        data[column.name] = column.value;
      });

      const url = `/${ model.name }`;
      util.fetchJSON(url, {
        method: 'POST',
        credentials: 'same-origin',
        data: data
      })
      .then(response => response.json())
      .then(json => {
        console.log('posted successfully', json);
      }).catch(err => {
        console.log('there was an error', err);
      });
    };
  },

  uploadRowFilesError(err) {
    // TODO: handle the error
    return {
      type: 'UPLOAD_ROW_FILES_ERROR'
    };
  },

  uploadRowFiles() {

    return (dispatch, getState) => {

      dispatch(this.uploadRowFilesBegin());

      const state = getState().components.createRowComponent;
      const { columns } = state;

      // build an array of promises for each file
      // that needs to be uploaded
      const filePromises = _.chain(columns)
        .map((column) => {
          const { files } = column;
          if (!files) {
            return null;
          }

          const directory = column.directory || '/';

          const formData = new FormData();
          formData.append('directory', directory);
          _.each(files, f => formData.append(f.name, f));

          const url = '/api/upload';
          return fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
          });
        })
        .compact()
        .value();

      Promise.all(filePromises)
      // map each of the responses to their JSON representation
      .then(responses => Promise.all(_.map(responses, r => r.json())))
      .then(responses => {
        // dispatch column value change events for each
        // of the uploaded files to update their value
        // before our final submit
        _.each(responses, (response, index) => {
          dispatch(this.changeColumnValue({
            index,
            columnValue: response.path
          }));
        });

        // finally dispatch an event notifying the reducer
        // that each of the files has been uploaded
        dispatch(this.uploadRowFilesSuccess());
      })
      .catch((err) => {
        // TODO: handle this error
        console.log('could not upload files');
        dispatch(this.uploadRowFilesError(err));
      });
    };
  }
};
