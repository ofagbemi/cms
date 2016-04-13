'use strict';

const _         = require('underscore');
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const tunnel    = require('tunnel-ssh');
const pascalize = require('uppercamelcase');

let server = tunnel({
  host: process.env.SSH_HOST,
  dstPort: process.env.SSH_PORT,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASS
}, (err, result) => {

  if (err) { throw err; }

  let sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS, {
    host: '127.0.0.1',
    dialect: 'mysql'
  });
  loadModels(sequelize);
});

/**
 * Loads and exports each of the models defined in
 * the lib folder
 *
 * @param {Sequelize} sequelize
 */
function loadModels(sequelize) {

  fs.readdir(path.join(__dirname, '/lib'), (err, files) => {

    if (err) { throw err; }

    for (let file of files) {
      if (!file.match(/\.json$/)) { return; }

      let table = file.replace(/\.json$/, '');
      let modelJSON = require('./lib/' + file);
      let model = sequelize.import(table, createImportCallback({
        table: table,
        modelJSON: modelJSON
      }));
      model.sync();
      exports[pascalize(table)] = model;
    }
  });
}

/**
 * @returns {function} a callback that can be passed to
 * Sequelize's import function
 */
function createImportCallback(params) {
  let table     = params.table;
  let modelJSON = params.modelJSON;
  return function(sequelize, types) {
    return defineModel(modelJSON, {
      sequelize: sequelize,
      types: types,
      table: table
    });
  };
}

/**
 * Defines the passed in model JSON
 *
 * @param {object} modelJSON
 * @param {string} params.table
 * @param {Sequelize} params.sequelize
 * @param {object} params.types
 *
 * @returns a Sequelize model object
 */
function defineModel(modelJSON, params) { // TODO: use destructring when available
  let table = params.table;
  let sequelize = params.sequelize;
  let types = params.types;

  return sequelize.define(table, toSequelizeFormat(modelJSON, types));
}

/**
 * Converts a JSON model to an object modified to use Sequelize
 * defined constants and validator specs
 *
 * @params {object} modelJSON
 * @params {object} types
 *
 * @returns {object} an object converted to use Sequelize
 * defined constants and validator specs
 */
function toSequelizeFormat(modelJSON, types) {
  let sequelized = {};
  _.each(modelJSON, function(value, key) {
    if (key === 'sequelizeType') {
      sequelized.type = types[value];
    } else if (key === 'sequelizeValidate') {
      sequelized.validate = value;
    } else if (_.isObject(value)) {
      sequelized[key] = toSequelizeFormat(value, types);
    } else {
      sequelized[key] = value;
    }
  });
  return sequelized;
}
