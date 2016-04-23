'use strict';

class RowsEditColumn {
  constructor($el) {
    if ($el.attr('data-type') === 'string') {
      return new StringType($el);
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

  get changed() {
    return this.value !== this._initialValue;
  }
}

StringType.prototype.init = function() { /* */ };
