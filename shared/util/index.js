'use strict';

const _          = require('underscore');
const urlJoin    = require('url-join');
const camelcase  = require('camelcase');
const pascalcase = require('uppercamelcase');
const trim       = require('underscore.string/trim');
const Constants  = require('../constants');

exports.getTableName = (displayName) => {
  // replace non-word characters with spaces before pacalcase
  // removes them and pascalizes properly
  let n = trim(displayName).replace(/\W+/g, ' ');
  return pascalcase(n);
};

/**
 * @param {string} a
 * @param {string} b
 */
exports.getJoinTableName = (a, b) =>  {
  let sorted = [a, b].sort();
  return sorted.join('_');
};

exports.getColumnName = (displayName) => {
  // replace non-word characters with spaces before camelcase
  // removes them and camelcases properly
  let columnName = trim(displayName).replace(/\W+/g, ' ');
  return camelcase(columnName);
};

exports.getReferenceName = (displayName) => {
  // replace non-word characters with spaces before camelcase
  // removes them and camelcases properly
  let referenceName = trim(displayName).replace(/\W+/g, ' ');
  return camelcase(referenceName);
};

/**
 * @params {string} url
 * @params {object} config
 * @params {object} config.body
 */
exports.fetchJSON = (url, config) => {
  const c = _.chain({})
    .defaults(config, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .omit('data')
    .value();

  c.body = JSON.stringify(config.data);
  return fetch(url, c);
};

exports.hciRootUrl = (path) => {
  return urlJoin(Constants.HCI_ROOT_URL, path);
};

exports.hciUploadsUrl = (url) => {
  return urlJoin(Constants.HCI_UPLOADS_URL, url);
};
