'use strict';

const async = require('async');
const _ = require('underscore');
const $ = require('jquery');

const ComponentFactory = require('../../../client/services/component-factory');

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

  try {
    this.data = JSON.parse(this.$el.find('script.model-data').remove().html());
  } catch (e) {
    this.data = {};
  }

  this.$form = this.$el.find('form#edit-form');
  this.$form.on('submit', _.bind(this._handleSubmit, this));
};

ModelsRowEdit.prototype._handleSubmit = function(e) {
  e.preventDefault();

  this.upload((err, result) => {

    if (err) {
      // TODO: handle error
      return;
    }

    let data = this.getData();
    let url = `/models/${this.data.schema._cms_.table.name}`;

    if (this.editMode) {
      url += `/row/${this.data.row.id}`;
    }

    $.ajax(url, {
      type: this.editMode ? 'PUT' : 'POST',
      data: data,
      xhrFields: { withCredentials: true }
    }).done((response) => {
      window.location = response.redirectUrl;
    }).fail((xhr, status, err) => {
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

module.exports = new ModelsRowEdit($('#models_row_edit'));
