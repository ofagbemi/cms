'use strict';

const $ = require('jquery');
const _ = require('underscore');
const Handlebars = require('hbsfy/runtime');

const ComponentFactory = require('./component-factory');

function TemplateRenderer() {
  this._templates = {};
  this._root = JSON.parse($('#hbs-root').remove().html());
}

TemplateRenderer.prototype.renderTemplate = function(name, data) {

  let template = this._templates[name];
  if (!template) {
    throw new Error(name + ' template hasn\'t been registered');
  }

  let html = template(data, {data: {root: this._root}});
  let $nodes = $(html);
  $nodes.each(function() {
    ComponentFactory.hydrate(this);
  });
  return $nodes;
};

TemplateRenderer.prototype.registerTemplate = function(name, template) {
  this._templates[name] = template;
  Handlebars.registerPartial(name, template);
};

module.exports = new TemplateRenderer();
