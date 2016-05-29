'use strict';

class StringExtras {
  constructor($el) {
    this.$el = $el;
  }

  init() {}

  getData() {
    let lenSelector = 'input[type="number"][name="maxlen"]';
    let maxlen = this.$el.find(lenSelector).val();
    return {
      maxlen: maxlen
    };
  }
}


module.exports = StringExtras;
