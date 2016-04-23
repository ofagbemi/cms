'use strict';

const _          = require('underscore');
const fs         = require('fs');
const path       = require('path');
const async      = require('async');
const Sequelize  = require('sequelize');
const tunnel     = require('tunnel-ssh');
const util       = require('../../shared/util');
const trim       = require('underscore.string/trim');
const escapeHTML = require('underscore.string/escapeHTML');

const DATA_TYPES = require('./data-types.json');
const SEQUELIZE_DEFINE_OPTS = {
  freezeTableName: true
};

class Models {
  constructor() {
    this._schemas = {};
    this._models = {};

    let server = tunnel({
      host: process.env.SSH_HOST,
      dstPort: process.env.SSH_DB_PORT,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASS,
      keepAlive: true
    }, (err, result) => {

      if (err) { throw err; }

      let sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS, {
          host: '127.0.0.1',
          dialect: 'mysql'
      });

      this._sequelize = sequelize;
      this._loadModels(this._schemas, this._models);
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
 * Creates a new model, loads it, and passes information about the
 * model to the caller
 *
 * @param {object} params
 * @param {string} params.displayName
 * @param {object[]} params.columns
 * @param {string} params.columns[].displayName
 * @param {string} params.columns[].type
 * @param {function} callback
 */
Models.prototype.create = function(params, callback) {
  let json = getJSON(params);
  this._writeJSON(json, (err, info) => {
    if (err) { return callback(err); }

    let tableName = info.tableName;
    this._loadModel(tableName, (err, model) => {
      if (err) { return callback(err); }

      callback(null, _.extend({}, info, { model: model }));
    });
  });
};

/**
 * Writes the passed in JSON to a file
 * @param {object} json
 * @param {function} callback
 */
Models.prototype._writeJSON = function(json, callback) {
  callback = callback || _.noop;
  if (!json || !json._cms_ || !json._cms_.table || !json._cms_.table.name) {
    return callback(new Error('No table name provided'));
  }

  let tableName = json._cms_.table.name;
  let writePath = path.join(__dirname, 'lib/', tableName + '.json');

  fs.open(writePath, 'w', (err, fd) => {

    if (err) { return callback(err); }

    const buffer = new Buffer(JSON.stringify(json, null, 2));
    fs.write(fd, buffer, 0, buffer.length, (err, bytes, buffer) => {
      if (err) { return callback(err); }

      callback(null, {
        path: writePath,
        tableName: tableName
      });
    });
  });
};


Models.prototype._loadModel = function(name, callback) {
  callback = callback || _.noop;

  let modelJSON = require('./lib/' + name + '.json');
  this._schemas[name] = modelJSON;
  let model = this._sequelize.import(name, createImportCallback({
    table: name,
    modelJSON: modelJSON
  }));
  model.sync().then(() => {
    callback(null, model);
  }).catch((err) => {
    callback(err);
  });
};

/**
 * Loads and each of the models defined in
 * the lib folder
 *
 * @param {Sequelize} sequelize
 * @param {object} modelsObj - Hash to store loaded models in
 */
Models.prototype._loadModels = function() {

  fs.readdir(path.join(__dirname, '/lib'), (err, files) => {

    if (err) { throw err; }

    const jsonRegex = /\.json$/;

    // just get the JSON files
    files = _.filter(files, (file) => {
      return file.search(jsonRegex) > -1;
    });

    // create an array of table names...
    let tables = _.map(files, (file) => {
      return file.replace(jsonRegex, '');
    });

    // ...then use that array of table names to build up
    // a hash of functions to run in parallel to collect
    // each of the sync'd models
    let parallelFns = _.object(tables, _.map(tables, (table) => {
      return (callback) => {
        this._loadModel(table, callback);
      };
    }));

    async.parallel(parallelFns, (err, result) => {
      if (err) { throw err; }
      _.extend(this._models, result);
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

  return sequelize.define(table, toSequelizeFormat(modelJSON, types), SEQUELIZE_DEFINE_OPTS);
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
      let type = types[value];
      if (modelJSON.sequelizeTypeArgs) {
        type = type(...modelJSON.sequelizeTypeArgs);
      }
      sequelized.type = type;
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

/**
 * @param {string} displayName
 * @returns {string}
 */
function sanitizeDisplayName(displayName) {
  return escapeHTML(trim(String(displayName)));
}

/**
 * @param {object} column
 * @returns {object}
 */
function sanitizeColumn(column) {
  let sanitized = _.pick(column, 'displayName', 'type');
  sanitized.displayName = sanitizeDisplayName(sanitized.displayName);
  if (!DATA_TYPES[sanitized.type]) {
    sanitized.type = 'string';
  }
  return sanitized;
}

/**
 * @param {string} params.displayName
 * @param {object[]} columns
 * @param {string} columns[].displayName
 * @param {string} columns[].type
 * @returns {object} table schema ready to be stringified
 * and saved
 */
function getJSON(params) {
  let displayName = sanitizeDisplayName(params.displayName);
  let columns = _.map(params.columns, sanitizeColumn);

  let json = {};
  let columnsJSON = [];
  for (let column of columns) {
    let name = util.getColumnName(column.displayName);
    columnsJSON.push({
      name: name,
      displayName: column.displayName
    });
    json[name] = _.extend(
      {},
      DATA_TYPES[column.type],
      getSchemaExtras(column)
    );
  }

  let tableName = util.getTableName(displayName);
  json._cms_ = {
    table: {
      name: tableName,
      displayName: displayName,
      columns: columnsJSON
    }
  };
  return json;
}

/**
 * Dirty, I know...
 *
 * @param {object} column
 *
 * @returns the extra object parameters that
 * need to be defined on the schema. In the example of files, adds
 * on a a root directory location that gets stored in the schema
 */
function getSchemaExtras(column) {
  let extras = {};
  if (column.type === 'file' && column.defaultDirectory) {
    _.extend(extras, {
      defaultDirectory: column.defaultDirectory
    });
  }
  return extras;
}

module.exports = new Models();
