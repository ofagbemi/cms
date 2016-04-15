'use strict';

const ComponentFactory = require('./services/component-factory');


// views
const ModelsCreateView = require('../views/models/create');
ModelsCreateView.init();

ComponentFactory.hydrate(document.documentElement);
