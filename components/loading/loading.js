import TemplateRenderer from '../../client/services/template-renderer';

module.exports = {
  loading: ($el) => {
    let el = $el.get(0);
    if ($el.hasClass('loading') && el.hasAttribute('data-loading')) {
      return;
    }

    let $loading = TemplateRenderer.renderTemplate('loading/loading');
    el.setAttribute('data-loading', true);
    $el.addClass('loading').append($loading);

    let pos = $el.css('position').toLowerCase();
    if (!pos || pos === 'static') {
      el.setAttribute('data-loading-positioned', true);
    }
  },

  finish: ($el) => {
    let el = $el.get(0);
    el.removeAttribute('data-loading');
    if (el.hasAttribute('data-loading-positioned')) {
      el.removeAttribute('data-loading-positioned');
    }
    $el.removeClass('loading')
       .find('[data-component="loading"]').remove();
  }
};

window.$ = require('jquery');
