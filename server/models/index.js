'use strict';

const _         = require('underscore');
const fs        = require('fs');
const path      = require('path');
const async     = require('async');
const Sequelize = require('sequelize');
const tunnel    = require('tunnel-ssh');

class Models {
  constructor() {
    this._schemas = {};
    this._models = {};

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

      this._loadModels(sequelize, this._schemas, this._models);
    });
  }

  get schemas() {
    return this._schemas;
  }

  get models() {
    return this._models;
  }
}

/**
 * Loads and each of the models defined in
 * the lib folder
 *
 * @param {Sequelize} sequelize
 * @param {object} modelsObj - Hash to store loaded models in
 */
Models.prototype._loadModels = function(sequelize, schemasObj, modelsObj) {

  fs.readdir(path.join(__dirname, '/lib'), (err, files) => {

    if (err) { throw err; }

    // create an array of table names...
    let tables = _.compact(_.map(files, (file) => {
      if (!file.match(/\.json$/)) { return null; }
      return file.replace(/\.json$/, '');
    }));

    // ...then use that array of table names to build up
    // a hash of functions to run in parallel to collect
    // each of the sync'd models
    let parallelFns = _.object(tables, _.map(tables, (table) => {
      return (callback) => {
        let modelJSON = require('./lib/' + table + '.json');

        if (schemasObj) { schemasObj[table] = modelJSON; }

        let model = sequelize.import(table, createImportCallback({
          table: table,
          modelJSON: modelJSON
        }));
        model.sync();
        callback(null, model);
      };
    }));

    async.parallel(parallelFns, (err, result) => {
      if (err) { throw err; }

      if (modelsObj) { _.extend(modelsObj, result); }
    });
  });
};

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
  for (let key in modelJSON) {

    if (!modelJSON.hasOwnProperty(key) || key.indexOf('_cms_') === 0) {
      continue;
    }

    let value = modelJSON[key];
    if (key === 'sequelizeType') {
      sequelized.type = types[value];
    } else if (key === 'sequelizeValidate') {
      sequelized.validate = value;
    } else if (_.isObject(value)) {
      sequelized[key] = toSequelizeFormat(value, types);
    } else {
      sequelized[key] = value;
    }
  }
  return sequelized;
}

module.exports = new Models();
