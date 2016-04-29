'use strict';

import $ from 'jquery';
import _ from 'underscore';
import {trim} from 'underscore.string';
import Loading from '../../components/loading/loading';
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
  this.$columns = this.$form.find('> .columns-wrapper > .columns');
  this.$references = this.$form.find('> .references-wrapper > .references');
  this.$displayName = this.$el.find('input[name="displayName"]');
  this.$addColumnButton = this.$form.find('button.add-column');

  this.$form.on('submit', _.bind(this._handleSubmit, this));
  this.$addColumnButton.on('click', _.bind(this._handleAddColumn, this));
  this.$el.on('keyup', this.$displayName,
              _.bind(this._handleDisplayNameKeyup, this));
  this.$el.on('click', '.reference-tags > .reference',
              _.bind(this._handleReferenceTagClick, this));
};

ModelsCreate.prototype._handleReferenceTagClick = function(e) {
  let referenceTableName = e.target.getAttribute('name');
  let referenceTableDisplayName = e.target.getAttribute('data-display-name');
  let $reference = TemplateRenderer.renderTemplate(
    'models/create/reference/reference',
    {
      foreignTable: {
        name: referenceTableName,
        displayName: referenceTableDisplayName
      }
    });

  this.$references.append($reference);
};

ModelsCreate.prototype._handleSubmit = function(e) {
  e.preventDefault();

  Loading.loading(this.$el);

  let data = this.getData();
  $.ajax('/models', {
    type: 'POST',
    data: data,
    xhrFields: { withCredentials: true }
  }).done((response) => {
    Loading.finish(this.$el);
    window.location = response.redirectUrl;
  }).fail((xhr, status, err) => {
    Loading.finish(this.$el);
    // TODO: do something
  });
};

ModelsCreate.prototype._handleAddColumn = function() {
  let $el = TemplateRenderer.renderTemplate('models/create/column/column');
  this.$columns.append($el);
};

ModelsCreate.prototype._handleDisplayNameKeyup = function(e) {
  let $target = $(e.target);
  let $caption = $target.siblings('.caption');
  let displayName = trim($target.val());
  if (displayName === '') {
    $caption.addClass('hide');
  } else {
    let tableName = util.getTableName(displayName);
    $caption.find('.table-name').text(tableName);
    $caption.removeClass('hide');
  }
};

ModelsCreate.prototype.getColumns = function() {
  let columns = [];
  this.$columns.find('[data-component="models_create_column"]').each((index, el) => {
    let column = ComponentFactory.getComponent(el);
    columns.push(column.getData());
  });
  return columns;
};

ModelsCreate.prototype.getReferences = function() {
  let references = [];
  this.$references.find('[data-component="models_create_reference"]').each((index, el) => {
    let reference = ComponentFactory.getComponent(el);
    references.push(reference.getData());
  });
  return references;
};

ModelsCreate.prototype.getData = function() {
  let data = {};
  data.displayName = this.$displayName.val();
  data.columns = this.getColumns();
  data.references = this.getReferences();
  return data;
};

module.exports = new ModelsCreate(document.querySelector('#models_create'));
