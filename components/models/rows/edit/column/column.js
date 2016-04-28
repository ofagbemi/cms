'use strict';

const _ = require('underscore');
const $ = require('jquery');

class RowsEditColumn {
  constructor($el) {
    switch($el.attr('data-type')) {
      case 'string': return new StringType($el);
      case 'file': return new FileType($el);
    }
  }
}

RowsEditColumn.prototype.init = function() { /* */ };


module.exports = RowsEditColumn;

class StringType {
  constructor($el) {
    this.$el = $el;
    this.$input = this.$el.find('input[type="text"]');
    this._initialValue = this.$input.val();

    this.columnName = this.$el.attr('data-columnName');
  }

  get value() {
    return this.$input.val();
  }

  getData() {
    return {
      [this.columnName]: this.value
    };
  }

  get changed() {
    return this.value !== this._initialValue;
  }
}

StringType.prototype.init = function() { /* */ };

class FileType {
  constructor($el) {

    this.$el = $el;
    this.$file = this.$el.find('input[type="file"]');
    this.$useDefaultDirectory = this.$el.find('input[type="checkbox"]');
    this.$directory = this.$el.find('input[type="text"].directory');
    this.defaultDirectory = this.$directory.attr('data-default');

    this._changed = false;

    this.columnName = this.$el.attr('data-columnName');
    this.$file.on('change', () => {
      this._changed = true;
    });

    this.data = null;

    this.$useDefaultDirectory.on(
      'change', _.bind(this._handleUseDefaultDirectory, this));
  }

  get changed() {
    return this._changed;
  }

  getData() {
    return {
      [this.columnName]: this.data
    };
  }

  upload(callback) {
    let formData = new FormData();
    _.each(this.$file.get(0).files, (file) => {
      formData.append(file.name, file);
    });

    let directory = this.$directory.val();
    formData.append('directory', directory || '/');

    let url = '/api/upload';
    $.ajax(url, {
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      xhrFields: { withCredentials: true }
    }).done((response) => {
      this.data = response.path;
      callback(null, response);
    }).fail((xhr, status, err) => {
      callback(err);
    });
  }
}

FileType.prototype.init = function() { /* */ };

FileType.prototype._handleUseDefaultDirectory = function() {
  if (this.$useDefaultDirectory.get(0).checked) {
    this.$directory.attr('disabled', true).val(this.defaultDirectory);
  } else {
    this.$directory.removeAttr('disabled').focus();
  }
};
