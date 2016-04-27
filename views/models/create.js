'use strict';

import $ from 'jquery';
import _ from 'underscore';
import {trim} from 'underscore.string';
import ComponentFactory from '../../client/services/component-factory';
import TemplateRenderer from '../../client/services/template-renderer';

import util from '../../shared/util';

class ModelsCreate {
  constructor(el) {
    this.$el = $(el);
  }
}

ModelsCreate.prototype.init = function() {
  if (!this.$el.length) { return; }

  if (this._init) { return; }

  this._init = true;

  this.$form = this.$el.find('form#create-form');
  this.$columns = this.$form.find('> .columns');
  this.$displayName = this.$el.find('input[name="displayName"]');
  this.$addColumnButton = this.$form.find('button.add-column');

  this.$form.on('submit', _.bind(this._handleSubmit, this));
  this.$addColumnButton.on('click', _.bind(this._handleAddColumn, this));
  this.$el.on('keyup', this.$displayName,
              _.bind(this._handleDisplayNameKeyup, this));
};

ModelsCreate.prototype._handleSubmit = function(e) {
  e.preventDefault();
  let data = this.getData();

  $.ajax('/models', {
    type: 'POST',
    data: data,
    xhrFields: { withCredentials: true }
  }).done((response) => {
    window.location = response.redirectUrl;
  }).fail((xhr, status, err) => {
    // TODO: do something
  });
};

ModelsCreate.prototype._handleAddColumn = function() {
  let $el = TemplateRenderer.renderTemplate('models/create/column/column');
  this.$columns.append($el);
};

ModelsCreate.prototype._handleDisplayNameKeyup = function(e) {
  let $target = $(e.target);
  let $sub = $target.siblings('.sub');
  let displayName = trim($target.val());
  if (displayName === '') {
    $sub.addClass('hide');
  } else {
    let tableName = util.getTableName(displayName);
    $sub.find('.table-name').text(tableName);
    $sub.removeClass('hide');
  }
};

ModelsCreate.prototype.getData = function() {
  let data = {};
  data.displayName = this.$displayName.val();
  data.columns = [];
  this.$el.find('[data-component="models_create_column"]').each((index, el) => {
    let column = ComponentFactory.getComponent(el);
    data.columns.push(column.getData());
  });
  return data;
};

module.exports = new ModelsCreate(document.querySelector('#models_create'));
