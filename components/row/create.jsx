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
