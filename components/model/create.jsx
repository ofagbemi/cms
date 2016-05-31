const connect  = require('react-redux').connect;
const Actions  = require('./actions');
const template = require('./create.template.jsx');

exports.component = connect(mapStateToProps, mapDispatchToProps)(template);
exports.reducer   = require('./reducer');

function mapStateToProps(state) {
  return state.components.createModelComponent;
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
      return dispatch(Actions.createModelThunk());
    }
  };
};
