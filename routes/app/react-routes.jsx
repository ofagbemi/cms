'use strict';

const React = require('react');
const Route = require('react-router').Route;
const IndexRoute = require('react-router').IndexRoute;

const AppComponent = require('../../components/app.jsx');
const CreateModelComponent = require('../../components/model/create.jsx').component;

module.exports = [
  <Route name="app" component={ AppComponent } path="/create">
    <IndexRoute component={CreateModelComponent} />
  </Route>
];
