'use strict';

import $ from 'jquery';
import _ from 'underscore';
import {trim} from 'underscore.string';

import util from '../../../../shared/util';
import ComponentFactory from '../../../../client/services/component-factory';
import TemplateRenderer from '../../../../client/services/template-renderer';

const EXTRAS_TEMPLATES_PATH = 'models/create/column/extras';
class ModelsCreateColumn {
  constructor(el) {
    this.$el = $(el);
  }
}

ModelsCreateColumn.prototype.init = function() {
  if (this._init) { return; }

  this._init = true;

  this.$columnDisplayName = this.$el.find('input[type="text"].column-display-name');
  this.$type = this.$el.find('select[name="type"]');
  this.$extras = this.$el.find('> .extras');

  this.$el.on('keyup', 'input[type="text"].column-display-name',
              _.bind(this._handleColumnDisplayNameKeyup, this));
  this.$el.on('change', 'select[name="type"]',
              _.bind(this._handleSelectType, this));
};

ModelsCreateColumn.prototype._handleColumnDisplayNameKeyup = function(e) {
  let $target = $(e.target);
  let $sub = $target.siblings('.sub');
  let displayName = trim($target.val());
  if (displayName === '') {
    $sub.addClass('hide');
  } else {
    let columnName = util.getColumnName(displayName);
    $sub.find('.column-name').text(columnName);
    $sub.removeClass('hide');
  }
};

ModelsCreateColumn.prototype._handleSelectType = function() {
  let type = this.$type.val();
  if (!type) { return; }

  let $e = TemplateRenderer.renderTemplate(`${EXTRAS_TEMPLATES_PATH}/${type}`);
  this.$extras.html($e);
};

ModelsCreateColumn.prototype.getExtras = function() {
  let obj = {};
  let $currentExtras = this.$extras.children().first();
  if ($currentExtras.length) {
    let extrasComponent = ComponentFactory.getComponent($currentExtras);
    _.extend(obj, extrasComponent.getData());
  }
  return obj;
};

ModelsCreateColumn.prototype.getData = function() {
  let obj = {
    displayName: this.$columnDisplayName.val(),
    type: this.$type.val()
  };
  _.extend(obj, this.getExtras());
  return obj;
};

module.exports = ModelsCreateColumn;
