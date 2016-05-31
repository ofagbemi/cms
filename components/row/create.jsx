const connect  = require('react-redux').connect;
const template = require('./create.template.jsx');

exports.component = connect()(template);
exports.reducer   = require('./reducer');

function mapStateToProps(state) {
  return state;
}
