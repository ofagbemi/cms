class Reference {
  constructor($el) {
    this.$el = $el;
  }

  init() {

  }

  getData() {
    let foreignTable = this.$el.attr('data-foreign-table');
    let displayName = this.$el.find('[name="displayName"]').val();
    let foreignDisplayName = this.$el.find('[name="foreignDisplayName"]').val();
    return {
      table: foreignTable,
      displayName: displayName,
      foreignDisplayName: foreignDisplayName
    };
  }
}

module.exports = Reference;
