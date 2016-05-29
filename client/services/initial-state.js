const $ = require('jquery');
const $state = $('script#initial-state');
let state = {};
try {
  state = JSON.parse($state.remove().html());
} catch (e) {
  console.log('Couldn\'t parse state');
  console.log(e);
}

module.exports = state;
