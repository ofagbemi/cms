'use strict';

const urlJoin = require('url-join');
const _       = require('underscore');
const capitalize = require('underscore.string/capitalize');

exports.capitalize = (string) => {
  return capitalize(string);
};

exports.json = (obj) => {
  return JSON.stringify(obj);
};

exports.at = (key, object) => {
  if (object && (key || key === 0)) {
    return object[key];
  }
};

exports.xif = (l, op, r, options) => {
  var success = false;
  switch(op) {
    case '===':
      success = l === r;
      break;
    case '>':
      success = l > r;
      break;
    case '<':
      success = l < r;
      break;
    case '&&':
      success = l && r;
      break;
    case 'contains':
      l = l || [];
      success = l.indexOf(r) !== -1;
      break;
  }

  return success ? options.fn(this) : options.inverse(this);
};

exports.hciRootUrl = (url) => {
  return urlJoin(process.env.HCI_ROOT_URL, url);
};

exports.hciUploadsUrl = (url) => {
  return urlJoin(process.env.HCI_UPLOADS_URL, url);
};
