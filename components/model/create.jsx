const _     = require('underscore');
const React = require('react');
const connect = require('react-redux').connect;
const update  = require('react-addons-update');

const util  = require('../../shared/util');
const template = require('./create.template.jsx');

const POST_URL = '/models';

const Actions = require('./actions');

function handleSubmitThunk() {

  return (dispatch, getState) => {

    const state = getState();
    const { tableDisplayName: displayName, references } = state;
    const columns = state.columns.map((column) => {
      return _.pick(column, 'type', 'displayName');
    });

    const data = {
      displayName,
      columns,
      references
    };

    dispatch(Actions.submit());

    return util.fetchJSON(POST_URL, {
      method: 'POST',
      credentials: 'same-origin',
      data: data
    })
    .then(response => response.json())
    .then((json) => {
      console.log('posted successfully', json);
      dispatch(Actions.submitSuccess(json));
    }).catch((err) => {
      console.log('there was an error', err);
      dispatch(Actions.submitError(err));
    });
  };
}

exports.component = connect(mapStateToProps, mapDispatchToProps)(template);
exports.reducer   = require('./reducer');

function mapStateToProps(state) {
  return {
    createMode: state.createMode,
    dataTypeLabels: state.dataTypeLabels,
    tableDisplayName: state.tableDisplayName,
    tableName: state.tableName,
    columns: state.columns,
    models: state.models,
    references: state.references
  }
};

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onTableDisplayNameChange(tableDisplayName) {
      return dispatch(Actions.changeTableDisplayName(tableDisplayName));
    },
    onAddColumn(column) {
      return dispatch(Actions.addColumn(column));
    },
    onColumnDisplayNameChange({ index, columnDisplayName }) {
      return dispatch(
        Actions.changeColumnDisplayName({index, columnDisplayName}));
    },
    onColumnTypeChange({ index, columnType }) {
      return dispatch(Actions.changeColumnType({ index, columnType }));
    },
    onReferenceTagClick({ index, model }) {
      return dispatch(Actions.clickReferenceTag({ index, model }));
    },
    onReferenceTableDisplayNameChange({ index, displayName }) {
      return dispatch(
        Actions.changeReferenceTableDisplayName({ index, displayName }));
    },
    onReferenceForeignTableDisplayNameChange({ index, foreignDisplayName }) {
      return dispatch(
        Actions.changeReferenceForeignTableDisplayName({ index, foreignDisplayName }));
    },
    onSubmit(e) {
      e.preventDefault();
      return dispatch(handleSubmitThunk());
    }
  };
};
