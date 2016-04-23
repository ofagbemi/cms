const _ = require('underscore');
const $ = require('jquery');

const ComponentFactory = require('../../../client/services/component-factory');

class ModelsRowCreate {
  constructor($el) {
    this.$el = $el;
  }
}

ModelsRowCreate.prototype.init = function() {

  if (!this.$el.length) { return; }

  if (this._init) { return; }
  this._init = true;


  try {
    this.data = JSON.parse(this.$el.find('script.model-data').remove().html());
  } catch (e) {
    this.data = {};
  }

  this.$form = this.$el.find('form#create-form');
  this.$form.on('submit', _.bind(this._handleSubmit, this));
};

ModelsRowCreate.prototype._handleSubmit = function(e) {
  e.preventDefault();

  let data = this.getData();
  let url = `/models/${this.data.schema._cms_.table.name}`;
  $.ajax(url, {
    type: 'POST',
    data: data,
    xhrFields: { withCredentials: true }
  }).done((response) => {
    window.location = response.redirectUrl;
  }).fail((xhr, status, err) => {
    // do something
  });
};

ModelsRowCreate.prototype.getData = function() {
  let data = {};
  this.$el.find('[data-component="models_rows_edit_column"]').each((i, el) => {
    let component = ComponentFactory.getComponent(el);
    if (component.changed) {
      let obj = {};
      obj[component.columnName] = component.value;
      _.extend(data, obj);
    }
  });
  return data;
};

module.exports = new ModelsRowCreate($('#models_row_create'));
