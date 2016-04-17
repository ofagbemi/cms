'use strict';

const capitalize = require('underscore.string/capitalize');

exports.capitalize = (string) => {
  return capitalize(string);
};

exports.json = (obj) => {
  return JSON.stringify(obj);
};
