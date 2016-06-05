'use strict';

const React = require('react');
const Route = require('react-router').Route;
const IndexRoute = require('react-router').IndexRoute;

const AppComponent = require('../../components/app.jsx');
const CreateModelComponent = require('../../components/model/create.jsx').component;
const CreateRowComponent   = require('../../components/row/create.jsx').component;
const ViewModelRowsComponent = require('../../components/model/view/view.jsx').component;
module.exports = [
  <Route name="app" component={ AppComponent } path="/create">
    <IndexRoute component={ CreateModelComponent } />
    <Route component={ CreateRowComponent } path="/:model/create" />
    <Route component={ ViewModelRowsComponent } path="/:model" />
  </Route>
];
