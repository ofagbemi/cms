'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const React          = require('react');
const ReactDOM       = require('react-dom');
const ReactRouter    = require('react-router');
const Router         = ReactRouter.Router;
const browserHistory = ReactRouter.browserHistory;
const Provider        = require('react-redux').Provider;
const createStore     = require('redux').createStore;
const applyMiddleware = require('redux').applyMiddleware;
const thunkMiddleware = require('redux-thunk').default;

const reactRoutes  = require('../routes/app/react-routes.jsx');
const initialState = require('./services/initial-state');
const AppComponent = require('../components/app.jsx');
const CreateModelComponent = require('../components/model/create.jsx').create;
const CreateModelComponentReducer = require('../components/model/create.jsx').reducer;

if (!initialState.noReact) {

  const createModelComponentStore = createStore(
    CreateModelComponentReducer,
    initialState,
    applyMiddleware(thunkMiddleware)
  );

  ReactDOM.render(
    <Provider store={createModelComponentStore}>
      <Router history={ browserHistory } routes={ reactRoutes } />
    </Provider>,
    document.getElementById('content')
  );
}

// ReactDOM.render(
//   <Provider store={createModelComponentStore}>
//
//   </Provider>
//   ,
//   document.getElementById('content'));

// const _ = require('underscore');
// const Handlebars = require('hbsfy/runtime');
// const ComponentFactory = require('./services/component-factory');
// const TemplateRenderer = require('./services/template-renderer');
//
// let hbsHelpers = require('../shared/hbs-helpers');
// _.each(hbsHelpers, (fn, name) => {
//   Handlebars.registerHelper(name, fn);
// });
//
// // components
// require('../components/modal/modal');
//
// TemplateRenderer.registerTemplate('loading/loading', require('../components/loading/loading.hbs'));
//
// ComponentFactory.registerComponent('models_create_column', require('../components/models/create/column/column'));
// TemplateRenderer.registerTemplate('models/create/column/column', require('../components/models/create/column/column.hbs'));
//
// ComponentFactory.registerComponent('models_create_reference', require('../components/models/create/reference/reference'));
// TemplateRenderer.registerTemplate('models/create/reference/reference', require('../components/models/create/reference/reference.hbs'));
//
// ComponentFactory.registerComponent('models_create_column_extras_file', require('../components/models/create/column/extras/file'));
// TemplateRenderer.registerTemplate('models/create/column/extras/file', require('../components/models/create/column/extras/file.hbs'));
//
// ComponentFactory.registerComponent('models_create_column_extras_string', require('../components/models/create/column/extras/string'));
// TemplateRenderer.registerTemplate('models/create/column/extras/string', require('../components/models/create/column/extras/string.hbs'));
//
// ComponentFactory.registerComponent('models_rows_edit_column', require('../components/models/rows/edit/column/column'));
//
// // ComponentFactory.registerComponent('models_rows_edit_reference_modal', require('../components/models/rows/edit/reference/modal'));
// TemplateRenderer.registerTemplate('models/rows/edit/reference/modal', require('../components/models/rows/edit/reference/modal.hbs'));
//
// TemplateRenderer.registerTemplate('models/rows/edit/reference/modal-body', require('../components/models/rows/edit/reference/modal-body.hbs'));
// ComponentFactory.registerComponent('models_rows_edit_reference_modal-body', require('../components/models/rows/edit/reference/modal-body'));
//
// TemplateRenderer.registerTemplate('models/rows/edit/reference/result', require('../components/models/rows/edit/reference/result.hbs'));
//
// // views
// const ModelsCreateView = require('../views/models/create');
// ModelsCreateView.init();
//
// const ModelsRowEdit = require('../views/models/row/edit');
// ModelsRowEdit.init();
//
// ComponentFactory.hydrate(document.documentElement);
