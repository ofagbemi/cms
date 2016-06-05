const combineReducers = require('redux').combineReducers;

module.exports = combineReducers({
  rows,
  model
});

function model(state = {}, { type }) {
  return state;
}

function rows(state = [], { type }) {
  return state;
}
