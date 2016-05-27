'use strict';

const _ = require('underscore');
const $ = require('jquery');
const querystring = require('querystring');

const TemplateRenderer = require('../../../../../client/services/template-renderer');

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
  this.$results = this.$el.find('.results-section > .results');
  this.$search = this.$el.find('input[type="text"].search');
  this.$searchBy = this.$el.find('select[name="search-by"]');
  this.$resultsSelectAll = this.$el.find(
    '.results-section header input[type="checkbox"]');

  this.$resultsSelectAll.on(
    'change', _.bind(this._handleSelectAllSearchResults, this));
  this.$el.on(
    'change', '.results .col > input[type="checkbox"]',
    _.bind(this._handleSelectSearchResult, this));
  const debouncedHandleSearchKeup = _.debounce(this._handleSearchKeyup, 300);
  this.$search.on('keyup', _.bind(debouncedHandleSearchKeup, this));
};

RowsEditReference.prototype._handleSelectAllSearchResults = function(e) {
  const $checkboxes = this.$results.find('.col > input[type="checkbox"]');
  const isChecked = this.$resultsSelectAll.get(0).checked;
  $checkboxes.prop('checked', isChecked);
};

RowsEditReference.prototype._handleSelectSearchResult = function(e) {
  const $checkboxes = this.$results.find('.col > input[type="checkbox"]');
  const $unchecked = $checkboxes.filter(':not(:checked)');

  const selectAllCheckboxEl = this.$resultsSelectAll.get(0);
  if ($unchecked.length === $checkboxes.length) {
    // no checkboxes checked — set select all checkbox to checked
    if (selectAllCheckboxEl.checked) {
      selectAllCheckboxEl.indeterminate = false;
      selectAllCheckboxEl.checked = false;
    }
  } else if ($unchecked.length === 0) {
    // all checkboxes checked - set select all checkbox to checked
    if (selectAllCheckboxEl.indeterminate || !selectAllCheckboxEl.checked) {
      selectAllCheckboxEl.indeterminate = false;
      selectAllCheckboxEl.checked = true;
    }
  } else {
    // some checkboxes checked - set select all checkbox to indeterminate
    selectAllCheckboxEl.indeterminate = true;
  }
};

RowsEditReference.prototype._handleSearchKeyup = function(e) {
  const val = this.$search.val();
  if (!val) { return; }

  const searchBy = this.$searchBy.find('option:selected').val();
  sendSearch({
    foreignTable: this.foreignTable,
    columns: [searchBy],
    value: val
  }).then((response) => {
    const elems = this.renderReferenceResults(response);
    this.$results.empty();
    _.each(elems, (el) => this.$results.append(el));

  }).catch((err) => {
    // TODO: handle
  });
};

/**
 * @param {string} params.tableName
 * @param {object} params.columns - should map from colum name --> value
 * @returns {Promise}
 */
function sendSearch({foreignTable, columns, value}) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();

    // add filter query parameters to the url using the
    // '=@' like operator
    const filter = [];
    _.each(columns, (column) => {
      filter.push(`${column}=@${value}`);
    });

    const q = querystring.stringify({
      filter: filter
    });
    const url = `/api/models/${foreignTable}?${q}`;
    $.ajax(url, {
      type: 'GET',
      xhrFields: { withCredentials: true }
    }).done((response) => {
      return resolve(response);
    }).fail((xhr, status, err) => {
      return reject(err);
    });
  });
}

RowsEditReference.prototype.renderReferenceResults = function(response) {
  return _.map(response, (row) => {
    return TemplateRenderer.renderTemplate('models/rows/edit/reference/result', {
      schema: this.foreignSchema,
      row: row,
      withCheckbox: true
    });
  });
};



module.exports = RowsEditReference;
