const connect  = require('react-redux').connect;
const template = require('./create.template.jsx');
const Actions  = require('./actions');

exports.component = connect(mapStateToProps, mapDispatchToProps)(template);
exports.reducer   = require('./reducer');

function mapStateToProps(state) {
  return state.components.createRowComponent;
}

function mapDispatchToProps(dispatch) {
  return {
    onSelectReferenceSidebar({ index }) {
      return dispatch(Actions.selectReferenceSidebar({ index }));
    },
    onShowEditReferences() {
      return dispatch(Actions.showEditReferences());
    },
    onHideEditReferences() {
      return dispatch(Actions.hideEditReferences());
    },
    onChangeReferenceSearchBy({ value, index }) {
      return dispatch(Actions.changeReferenceSearchBy({ value, index }))
    },
    onSearchReferenceRows({ query, foreignModel, columnName, index }) {
      return dispatch(Actions.searchReferenceRows({ query, foreignModel, columnName, index }));
    },
    onAddReferenceRow({ foreignName, row }) {
      return dispatch(Actions.addReferenceRow({ foreignName, row }));
    },
    onColumnValueChange({ columnValue, index }) {
      return dispatch(Actions.changeColumnValue({ columnValue, index }))
    },
    onColumnFileChange({ columnFiles, index }) {
      return dispatch(Actions.changeColumnFiles({ columnFiles, index }))
    },
    onSubmit(e) {
      e.preventDefault();
      return dispatch(Actions.createRow());
    }
  }
}
