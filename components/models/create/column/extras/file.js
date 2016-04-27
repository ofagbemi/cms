'use strict';

class FileExtras {
  constructor($el) {
    this.$el = $el;
  }

  init() {}

  getData() {
    let dirSelector = 'input[type="text"][name="directory"]';
    let defaultDirectory = this.$el.find(dirSelector).val();
    return {
      defaultDirectory: defaultDirectory
    };
  }
}


module.exports = FileExtras;
