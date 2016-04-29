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
const COLUMN_PARAMS_WHITELIST = [
  'defaultDirectory',
  'displayName',
  'type'
];

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
  callback = callback || _.noop;
  let json = this._getJSON(params);

  this._writeJSON(json).then((info) => {
    // update each of the json files this new model references
    // with references to this model
    let references = json.references;
    let parallelFns = _.map(references, (reference) => {

      return (cb) => {
        // since the references are just on the schema, we
        // only need to update the in memory schemas. We don't need to reload
        // the model object
        let schema = this.schemas[reference];
        schema.references = schema.references || [];
        schema.references.push(json.name);

        // finish by writing the updated schema to the file system
        this._writeJSON(schema)
          .then((result) => cb(null, result))
          .catch((err) => cb(err));
      };
    });

    async.parallel(parallelFns, (err) => {
      if (err) { return callback(err); }

      let tableName = info.tableName;
      this._loadModel(tableName, (err, model) => {
        if (err) { return callback(err); }

        return callback(null, _.extend({}, info, { model: model }));
      });
    });
  }).catch((err) => {
    return callback(err);
  });
};

/**
 * Writes the passed in JSON to a file
 * @param {object} json
 */
Models.prototype._writeJSON = function(json) {
  return new Promise((resolve, reject) => {
    if (!json || !json.name) {
      return reject(new Error('No table name provided'));
    }

    let tableName = json.name;
    let writePath = path.join(__dirname, 'lib/', tableName + '.json');

    fs.open(writePath, 'w', (err, fd) => {

      if (err) { return reject(err); }

      const buffer = new Buffer(JSON.stringify(json, null, 2));
      fs.write(fd, buffer, 0, buffer.length, (err, bytes, buffer) => {
        if (err) { return reject(err); }

        resolve({
          path: writePath,
          tableName: tableName
        });
      });
    });
  });
};


Models.prototype._loadModel = function(name, callback) {
  callback = callback || _.noop;

  let modelJSON = require('./lib/' + name + '.json');
  this._schemas[name] = modelJSON;
  let model =  this._models[name] = this._sequelize.import(name,
    this._createImportCallback({
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
Models.prototype._createImportCallback = function(params) {
  let table     = params.table;
  let modelJSON = params.modelJSON;
  return (sequelize, types) => {
    return this._defineModel(modelJSON, {
      sequelize: sequelize,
      types: types,
      table: table
    });
  };
};

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
Models.prototype._defineModel = function(modelJSON, params) { // TODO: use destructring when available
  let table = params.table;
  let sequelize = params.sequelize;
  let types = params.types;

  return sequelize.define(
    table,
    this._toSequelizeFormat(modelJSON, types),
    SEQUELIZE_DEFINE_OPTS);
};

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
Models.prototype._toSequelizeFormat = function(modelJSON, types) {
  let sequelized = {};
  _.each(modelJSON.columns, (column) => {
    let dataTypeSpec = DATA_TYPES[column.type];
    let sequelizeType = types[dataTypeSpec.type];
    if (dataTypeSpec.typeArgs) {
      sequelizeType = sequelizeType(...dataTypeSpec.typeArgs);
    }
    sequelized[column.name] = {
      type: sequelizeType,
      validate: dataTypeSpec.validate
    };
  });
  return sequelized;
};

/**
 * @param {string} displayName
 * @returns {string}
 */
Models.prototype._sanitizeDisplayName = function(displayName) {
  return escapeHTML(trim(String(displayName)));
};

/**
 * @param {object} column
 * @returns {object}
 */
Models.prototype._sanitizeColumn = function(column) {
  let sanitized = _.pick(column, ...COLUMN_PARAMS_WHITELIST);
  sanitized.displayName = this._sanitizeDisplayName(sanitized.displayName);
  if (!DATA_TYPES[sanitized.type]) {
    sanitized.type = 'string';
  }
  return sanitized;
};

/**
 * @param {string} reference
 * @returns {string|null}
 */
Models.prototype._sanitizeReference = function(reference) {
  if (!_.isString(reference)) { return null; }
  if (!this.models[reference]) { return null; }
  return reference;
};

/**
 * @param {string} params.displayName
 * @param {object[]} columns
 * @param {string} columns[].displayName
 * @param {string} columns[].type
 * @returns {object} table schema ready to be stringified
 * and saved
 */
Models.prototype._getJSON = function(params) {
  let displayName = this._sanitizeDisplayName(params.displayName);
  let columns = _.map(params.columns, _.bind(this._sanitizeColumn, this));
  let references = _.map(params.references,
    _.bind(this._sanitizeReference, this));
  references = _.unique(_.compact(references));

  let columnsJSON = [];
  for (let column of columns) {
    let name = util.getColumnName(column.displayName);
    columnsJSON.push(_.extend({
      name: name,
      displayName: column.displayName,
      type: column.type
    }, this._getSchemaExtras(column)));
  }

  let tableName = util.getTableName(displayName);
  return {
    name: tableName,
    displayName: displayName,
    columns: columnsJSON,
    references: references
  };
};

/**
 * Dirty, I know...
 *
 * @param {object} column
 *
 * @returns the extra object parameters that
 * need to be defined on the schema. In the example of files, adds
 * on a a root directory location that gets stored in the schema
 */
Models.prototype._getSchemaExtras = function(column) {
  let extras = {};
  if (column.type === 'file' && column.defaultDirectory) {
    _.extend(extras, {
      defaultDirectory: column.defaultDirectory
    });
  }
  return extras;
};

module.exports = new Models();
