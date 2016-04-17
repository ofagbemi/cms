'use strict';

import $ from 'jquery';
import _ from 'underscore';
import {trim} from 'underscore.string';

import util from '../../../../shared/util';

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

  this.$el.on('keyup', this.$columnDisplayName,
              _.bind(this._handleColumnDisplayNameKeyup, this));
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

ModelsCreateColumn.prototype.getData = function() {
  return {
    displayName: this.$columnDisplayName.val(),
    type: this.$type.val()
  };
};

module.exports = ModelsCreateColumn;
