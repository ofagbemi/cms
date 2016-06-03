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

  uploadRowFilesSuccess() {

  },

  uploadRowFilesError(err) {

  },

  uploadRowFiles() {

    return (dispatch, getState) => {

      const state = getState().components.createRowComponent;
      const { columns } = state;

      // handle file uploads
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
        dispatch(this.uploadRowFilesError());
      });
    };
  }
};


// upload() {
//   return new Promise((resolve, reject) => {
//
//     const {
//       column,
//       index,
//       onColumnValueChange,
//
//     } = this.props;
//
//     if (!this.fileInput) return reject();
//
//     const formData = new FormData();
//     _.each(this.fileInput.files, (file) => {
//       formData.append(file.name, file);
//     });
//
//     const directory = column.directory || '/';
//     const url = '/api/upload';
//
//     fetch(url, {
//       method: 'POST',
//       body: formData,
//       credentials: 'same-origin'
//     })
//     .then(response => response.json())
//     .then((json) => {
//       const path = json.path;
//       onColumnValueChange({ columnValue: path, index });
//     }).catch((err) => {
//       return reject(err);
//     });
//
//   });
// },
