'use strict';

const $ = require('jquery');
const _ = require('underscore');
const TRANSITION_TIMEOUT = 400;

class Modal {
  constructor() {
    this.$el = $('<div id="modal"></div>');
    this.$content = $('<div class="modal-content"></div>');
    this.$el.append(this.$content);

    this.$el.on('click', _.bind(this._handleClick, this));
    $('body').append(this.$el);
  }

  get visible() {
    return this.$el.hasClass('show');
  }

  show($content) {
    return new Promise((resolve) => {
      this.hide().then(() => {
        this.$content.empty().append($content);
        this.$el.addClass('transition-show');
        setTimeout(() => {
          this.$el
            .addClass('show')
            .removeClass('transition-show');
            setTimeout(() => resolve(), TRANSITION_TIMEOUT);
        });
      });
    });
  }

  hide() {
    return new Promise((resolve) => {
      if (!this.visible) { return resolve(); }
      this.$el.addClass('transition-hide');
      setTimeout(() => {
        this.$el.removeClass('show');
        this.$el.removeClass('transition-hide');
        setTimeout(() => resolve(), TRANSITION_TIMEOUT);
      });
    });
  }

  _handleClick(e) {
    // click outside of the modal popup
    if (!$.contains(this.$content, e.target)) {
      this.hide();
    }
  }
}



module.exports = window.Modal = new Modal();
