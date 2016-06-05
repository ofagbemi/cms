const combineReducers      = require('redux').combineReducers;
const createModelComponent = require('../model/create.jsx').reducer;
const createRowComponent   = require('../row/create.jsx').reducer;
const viewModelRowsComponent = require('../model/view/view.jsx').reducer;

module.exports = combineReducers({
    createModelComponent,
    createRowComponent,
    viewModelRowsComponent
});
