'use strict';

const ComponentFactory = require('./services/component-factory');


// views
const ModelsView = require('../views/models');
ModelsView.init();

ComponentFactory.hydrate(document.documentElement);
