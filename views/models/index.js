const $ = require('jquery');
const _ = require('underscore');

class Models {
  constructor(el) {
    this.$el = $(el);
  }
}

Models.prototype.init = function() {
  if (this._init) { return; }
  this._init = true;
};

module.exports = new Models(document.querySelector('#models'));
