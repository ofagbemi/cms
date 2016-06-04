'use strict';

const _      = require('underscore');
const async  = require('async');
const pluralize = require('pluralize');
const router = require('express').Router();

const Models = require('../../../server/models');
const util   = require('../../../shared/util');
const Constants = require('../../../shared/constants');

/**
 * @api {get} /models/schemas
 *
 * Returns either a JSON hash of every defined schema
 */
router.get('/schemas', (req, res) => {
  res.json(Models.schemas);
});

router.get('/schemas/:model', (req, res, nex) => {
  let modelName = req.params.model;
  let schema = Models.schemas[modelName];

  if (!schema) {
    return res.status(404).json({error: `Schema ${modelName} could not be found`});
  } else {
    return res.json(schema);
  }
});

/**
 * @api {get} /models/:model
 *
 * @param {string[]} filter Strings of the form `${columnName}==${value}` for
 * case-insensitive equality or `${columnName}=@${value}` for fuzzy searching
 * by column values
 */
router.get('/:model', validateModel, (req, res, next) => {

  let model = req.data.model;
  let schema = req.data.schema;

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit, 10) || Constants.DEFAULT_ROW_LIMIT;
  if (limit > Constants.MAX_ROW_LIMIT) {
    limit = Constants.MAX_ROW_LIMIT;
  }

  let where = processFilters(req.query.filter, schema);

  model.findAll({
    limit: limit,
    offset: (page - 1) * limit,
    order: [['id', 'ASC']],
    where: where
  }).then((rows) => {
    rows = _.map(rows, (row) => row.dataValues );
    return res.json(rows);
  }).catch((err) => {
    return next(err);
  });
});

router.get('/:model/row/:id', validateModel, (req, res, next) => {
  let model = req.data.model;
  let id = req.params.id;
  model.findById(id).then((row) => {
    if (!row) {
      return res.status(404).json({
        error: `${req.params.model} with id ${id} could not be found`
      });
    } else {
      return res.json(row);
    }
  }).catch((err) => {
    return next(err);
  });
});

router.post('/:model', validateModel, (req, res, next) => {
  const schema = req.data.schema;
  const model  = req.data.model;
  const data   = _.omit(req.body, 'references');
  const references = req.body.references;

  // don't bother with sanitization here -- validators
  // attached to the object will take care of it
  model.create(data).then(row => {
    const parallelFns = _.map(references, (ids, refName) => {

      return (callback) => {
        const foreignSchemaRef = _.find(
          schema.references,
          ref => ref.foreignName === refName);

        if (!foreignSchemaRef) {
          return callback(
            new Error(
              `could not find '${ refName }' in '${ schema.name }' ` +
              `references`)
          );
        }

        const addFnName = `add${ util.pascalcase(pluralize(refName)) }`;
        let addFn       = row[addFnName];
        if (!addFn) {
          // TODO: might want to log this somewhere, in case we ever
          // can't get the proper function name this way
          return callback(
            new Error(
              `could not find function '${addFnName}' in ` +
              `model '${ schema.name }' row`)
          );
        }

        addFn = addFn.bind(row);

        const foreignModel = Models.models[foreignSchemaRef.foreignTable];
        if (!foreignModel) return;

        foreignModel.findAll({
          where: { id: ids }
        }).then(items => {
          addFn(items)
            .then(() => callback())
            .catch(err => callback(err));
        }).catch(err => callback(err));
      };
    });

    async.parallel(parallelFns, (err) => {
      if (err) return next(err);
      return res.json(row.dataValues);
    });
  });
});

router.put('/:model/row/:id', validateModel, (req, res, next) => {
  let model = req.data.model;
  let id = req.params.id;

  let data = req.body;

  // TODO may want to check for some sort of permissions
  // here
  // don't bother with sanitization here -- validators
  // attached to the object will take care of it
  model.update(data, {
    where: { id: id }
  }).then((result) => {
    return res.json({ msg: 'Update successful' });
  }).catch((err) => {
    return next(err);
  });

});

/**
 * @api {post} /api/models
 * Creates a new model
 *
 * @apiParam {string} displayName
 * @apiParam {{ displayName:string, type:string }[]} columns
 * @apiParam {{
 *   table:string,
 *   displayName:string,
 *   foreignDisplayName:string }[]} references
 */
router.post('/', (req, res, next) => {
  let data = req.body;

  Models.create({
    displayName: data.displayName,
    columns: data.columns,
    references: data.references
  }, (err, info) => {
    if (err) { return next(err); }
    res.json({msg: `Saved new table ${info.tableName}`});
  });
});

module.exports = router;

function processFilters(filters, schema) {
  if (!filters) {
    return {};
  } else if (_.isString(filters)) {
    filters = [filters];
  } else if (!_.isArray(filters)) {
    return {};
  }

  let where = {};
  _.each(filters, (param) => {
    let match = null;
    let op = null;
    let column = null;
    let value = null;

    // go through the regex's in order of priority
    for (let exps of Constants.FILTER_REGEXES) {
      match = param.match(exps.regex);
      if (match) {
        op = exps.op;
        column = match[1];

        // call the transform function or some function
        // that just returns the match
        value = (exps.transform || _.identity)(match[2]);
        break;
      }
    }

    // if none of the regex's matched, then skip
    // this filter
    if (!match) { return; }

    // if the column name isn't a valid member of the schema,
    // skip over it
    let columnNames = _.map(schema.columns, (col) => col.name);
    if (schema && columnNames.indexOf(column) === -1) {
      return;
    }

    let filter = {};

    if (op === 'equal') {
      filter[column] = value;
    } else {
      let ref = filter[column] = {};
      ref[op] = value;
    }

    // add this set of filters to the returned
    // 'where' hash
    _.extend(where, filter);
  });

  return where;
}

function validateModel(req, res, next) {

  let model = Models.models[req.params.model];
  let schema = Models.schemas[req.params.model];

  if (!model) {
    return next(new Error(`Model ${req.params.model} could not be found`));
  } else if (!schema) {
    return next(new Error(`Schema ${req.params.model} could not be found`));
  }

  req.data = req.data || {};
  req.data.model = model;
  req.data.schema = schema;

  return next();
}
