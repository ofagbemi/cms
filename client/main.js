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

// views
const ModelsCreateView = require('../views/models/create');
ModelsCreateView.init();

ComponentFactory.hydrate(document.documentElement);
