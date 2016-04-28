'use strict';

const _ = require('underscore');
const Handlebars = require('hbsfy/runtime');
const ComponentFactory = require('./services/component-factory');
const TemplateRenderer = require('./services/template-renderer');

let hbsHelpers = require('../shared/hbs-helpers');
_.each(hbsHelpers, (fn, name) => {
  Handlebars.registerHelper(name, fn);
});

// components
ComponentFactory.registerComponent('models_create_column', require('../components/models/create/column/column'));
TemplateRenderer.registerTemplate('models/create/column/column', require('../components/models/create/column/column.hbs'));

ComponentFactory.registerComponent('models_create_column_extras_file', require('../components/models/create/column/extras/file'));
TemplateRenderer.registerTemplate('models/create/column/extras/file', require('../components/models/create/column/extras/file.hbs'));

ComponentFactory.registerComponent('models_create_column_extras_string', require('../components/models/create/column/extras/string'));
TemplateRenderer.registerTemplate('models/create/column/extras/string', require('../components/models/create/column/extras/string.hbs'));

ComponentFactory.registerComponent('models_rows_edit_column', require('../components/models/rows/edit/column/column'));

// views
const ModelsCreateView = require('../views/models/create');
ModelsCreateView.init();

const ModelsRowEdit = require('../views/models/row/edit');
ModelsRowEdit.init();

ComponentFactory.hydrate(document.documentElement);
