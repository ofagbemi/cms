'use strict';

const _ = require('underscore');
const $ = require('jquery');
const querystring = require('querystring');

class RowsEditReference {
  constructor($el) {
    this.$el = $el;
    this.foreignTable = this.$el.attr('data-foreign-table');

    try {
      this.foreignSchema = JSON.parse(
        this.$el.find('script.foreign-schema')
          .remove()
          .html());
    } catch (e) { /* */ }
  }
}

RowsEditReference.prototype.init = function() {
  this.$results = this.$el.find('.results');
  this.$search = this.$el.find('input[type="text"].search');

  const debouncedHandleSearchKeup = _.debounce(this._handleSearchKeyup, 300);
  this.$search.on('keyup', _.bind(debouncedHandleSearchKeup, this));
};

RowsEditReference.prototype._handleSearchKeyup = function(e) {

  // get the names of every searchable column
  const searchableColumns = _.compact(
    _.map(this.foreignSchema.columns, (c) => {
      if (c.searchable) return c.name;
      return null;
    })
  );
  sendSearch({
    foreignTable: this.foreignTable,
    columns: searchableColumns,
    value: this.$search.val()
  });
};

/**
 * @param {string} params.tableName
 * @param {object} params.columns - should map from colum name --> value
 */
function sendSearch({foreignTable, columns, value}) {
  const timestamp = Date.now();

  // add filter query parameters to the url using the
  // '=@' like operator
  const filters = [];
  _.each(columns, (column) => {
    filters.push(`${column}=@${value}`);
  });

  const q = querystring.stringify({ filters: filters });
  const url = `/api/models/${foreignTable}?${q}`;

  $.ajax(url, {
    type: 'GET',
    xhrFields: { withCredentials: true }
  }).done((response) => {

  }).fail((xhr, status, err) => {

  });
}

module.exports = RowsEditReference;
