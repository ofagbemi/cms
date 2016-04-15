'use strict';

import $ from 'jquery';
import _ from 'underscore';
import {trim} from 'underscore.string';

import util from '../../shared/util';

class ModelsCreate {
  constructor(el) {
    this.$el = $(el);
  }
}

ModelsCreate.prototype.init = function() {
  if (this._init) { return; }

  this._init = true;

  this.$el.on('keyup', 'input[name="tableDisplayName"]',
              _.bind(this._handleTableDisplayNameKeyup, this));
  this.$el.on('keyup', 'input[type="text"].column-display-name',
              _.bind(this._handleColumnDisplayNameKeyup, this));
};

ModelsCreate.prototype._handleTableDisplayNameKeyup = function(e) {
  console.log(util);
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

ModelsCreate.prototype._handleColumnDisplayNameKeyup = function(e) {
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

module.exports = new ModelsCreate(document.querySelector('#models_create'));
