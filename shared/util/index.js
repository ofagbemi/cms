'use strict';

import camelcase from 'camelcase';
import pascalcase from 'uppercamelcase';

import {trim} from 'underscore.string';

exports.getTableName = (displayName) => {
  // replace non-word characters with spaces before pacalcase
  // removes them and pascalizes properly
  let n = trim(displayName).replace(/\W+/g, ' ');
  return pascalcase(n);
};

exports.getColumnName = (displayName) => {
  // replace non-word characters with spaces before camelcase
  // removes them and camelcases properly
  let columnName = trim(displayName).replace(/\W+/g, ' ');
  return camelcase(columnName);
};
