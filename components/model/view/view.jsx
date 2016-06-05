const connect  = require('react-redux').connect;
// const Actions  = require('./actions');
const template = require('./view.template.jsx');

exports.component = connect(mapStateToProps, mapDispatchToProps)(template);
exports.reducer   = require('./reducer');

function mapStateToProps(state) {
  return state.components.viewModelRowsComponent;
};

function mapDispatchToProps(dispatch) {
  return {};
}
