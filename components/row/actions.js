const _    = require('underscore');
const util = require('../../shared/util');
const querystring = require('querystring');

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
        model,
        references
      } = getState().components.createRowComponent;

      // TODO: only send updated columns
      const data = {};
      _.each(columns, column => {
        data[column.name] = column.value;
      });

      // only send up the row IDs to the server
      data.references = _.mapObject(references, rows => {
        return _.map(rows, row => row.id);
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
  },

  showEditReferences() {
    return {
      type: 'SHOW_EDIT_REFERENCES'
    };
  },

  hideEditReferences() {
    return {
      type: 'HIDE_EDIT_REFERENCES'
    };
  },

  changeReferenceSearchBy({ value, index }) {
    return {
      type: 'CHANGE_REFERENCE_SEARCH_BY',
      value,
      index
    }
  },

  // TODO: figure out how to debounce this on a per
  // reference basis
  searchReferenceRows({ foreignModel, columnName, query, index }) {
    return (dispatch, getState) => {

      const state = getState().components.createRowComponent;

      // add filter query parameters to the url using the
      // '=@' like operator
      // TODO: add support for searching multiple columns at once / or
      // implement elastic search
      const filter = [];
      filter.push(`${columnName}=@${query}`);

      const q = querystring.stringify({ filter });
      const url = `/api/models/${ foreignModel.name }?${ q }`;

      fetch(url, {
        type: 'GET',
        credentials: 'same-origin'
      })
      .then(response => response.json())
      .then(searchResults => {
        return dispatch(this.searchReferenceRowsSuccess({ searchResults, index }));
      })
      .catch(err => {
        return dispatch(this.searchReferenceRowsError({ err, index }));
      });
    };
  },

  searchReferenceRowsBegin() {
    return {
      type: 'SEARCH_REFERENCE_ROWS_BEGIN'
    };
  },

  searchReferenceRowsSuccess({ searchResults, index }) {
    return {
      type: 'SEARCH_REFERENCE_ROWS_SUCCESS',
      searchResults,
      index
    };
  },

  searchReferenceRowsError({ err, index }) {
    return {
      type: 'SEARCH_REFERENCE_ROWS_ERROR',
      err,
      index
    };
  },

  addReferenceRow({ foreignName, row }) {
    return {
      type: 'ADD_REFERENCE_ROW',
      foreignName,
      row
    }
  },
  selectReferenceSidebar({ index }) {
    return {
      type: 'SELECT_REFERENCE_SIDEBAR',
      index
    }
  }
};
