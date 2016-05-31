const combineReducers = require('redux').combineReducers;

module.exports = combineReducers({
  createMode
});

function createMode(state = true) {
  return state;
}
