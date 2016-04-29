'use strict';

const camelcase  = require('camelcase');
const pascalcase = require('uppercamelcase');
const trim       = require('underscore.string/trim');

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
