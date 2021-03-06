'use strict';

import async from 'async';
import _ from 'underscore';
import $ from 'jquery';

import Modal from '../../../components/modal/modal';
import Loading from '../../../components/loading/loading';
import ComponentFactory from '../../../client/services/component-factory';
import TemplateRenderer from '../../../client/services/template-renderer';

class ModelsRowEdit {
  constructor($el) {
    this.$el = $el;
  }

  get createMode() {
    return this.$el.get(0).hasAttribute('data-create');
  }

  get editMode() {
    return !this.createMode;
  }
}

ModelsRowEdit.prototype.init = function() {

  if (!this.$el.length) { return; }

  if (this._init) { return; }
  this._init = true;

  this.data = {};

  try {
    this.data.schema = JSON.parse(this.$el.find('script.schema').remove().html());
  } catch (e) { /* */ }

  try {
    this.data.row = JSON.parse(this.$el.find('script.row').remove().html());
  } catch(e) { /* */ }

  this.$editReferencesButton = this.$el.find('button.edit-references');

  this.$editReferencesButton.on('click', _.bind(this._handleReferences, this));
  this.$form = this.$el.find('form#edit-form');
  this.$form.on('submit', _.bind(this._handleSubmit, this));
};

ModelsRowEdit.prototype._handleSubmit = function(e) {
  e.preventDefault();

  Loading.loading(this.$el);
  this.upload((err, result) => {

    if (err) {
      Loading.finish(this.$el);
      // TODO: handle error
      return;
    }

    let data = this.getData();
    let url = `/models/${this.data.schema.name}`;

    if (this.editMode) {
      url += `/row/${this.data.row.id}`;
    }

    $.ajax(url, {
      type: this.editMode ? 'PUT' : 'POST',
      data: data,
      xhrFields: { withCredentials: true }
    }).done((response) => {
      Loading.finish(this.$el);
      window.location = response.redirectUrl;
    }).fail((xhr, status, err) => {
      Loading.finish(this.$el);
      // TODO: do something
    });
  });
};

ModelsRowEdit.prototype.upload = function(callback) {

  let parallelFns = [];
  this.$el.find('[data-component="models_rows_edit_column"]').each((i, el) => {
    let component = ComponentFactory.getComponent(el);
    if (component.changed && _.isFunction(component.upload)) {
      parallelFns.push((cb) => {
        component.upload(cb);
      });
    }
  });

  async.parallel(parallelFns, (err, result) => {
    if (err) { return callback(err); }
    callback(null, result);
  });
};

ModelsRowEdit.prototype.getData = function() {
  let data = {};
  this.$el.find('[data-component="models_rows_edit_column"]').each((i, el) => {
    let component = ComponentFactory.getComponent(el);
    if (component.changed) {
      _.extend(data, component.getData());
    }
  });
  return data;
};

ModelsRowEdit.prototype._handleReferences = function() {
  const $modalContent = TemplateRenderer.renderTemplate('models/rows/edit/reference/modal', {
    references: this.data.schema.references
  });
  Modal.show($modalContent);
};

module.exports = new ModelsRowEdit($('#models_row_edit'));
