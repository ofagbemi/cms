'use strict';

const _      = require('underscore');
const Models = require('../../../server/models');
const router = require('express').Router();

const DATA_TYPES = require('../../../server/models/data-types.json');
const DEFAULT_ROW_LIMIT = 20;
const MAX_ROW_LIMIT = 100;
const FILTER_REGEXES = [{
  op: 'equal',
  regex: /(.+)\=\=(.+)/
}, {
  op: '$like',
  regex: /(.+)\=\@(.+)/,
  transform: (str) => `%${str}%`
}];

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

router.get('/:model', validateModel, (req, res, next) => {

  let model = req.data.model;
  let schema = req.data.schema;

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit, 10) || DEFAULT_ROW_LIMIT;
  if (limit > MAX_ROW_LIMIT) {
    limit = MAX_ROW_LIMIT;
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
  let model = req.data.model;

  let data = req.body;

  // don't bother with sanitization here -- validators
  // attached to the object will take care of it
  model.create(data).then((result) => {
    return res.json(result.dataValues);
  }).catch((err) => {
    return next(err);
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

router.post('/', (req, res, next) => {
  let data = req.body;
  Models.create({
    displayName: data.displayName,
    columns: data.columns
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
    for (let exps of FILTER_REGEXES) {
      match = param.match(exps.regex);
      if (match) {
        op = exps.op;
        column = match[1];

        // call the transform function or some function
        // that just returns the match
        value = (exps.transform || ((val) => val))(match[2]);
        break;
      }
    }

    // if none of the regex's matched, then skip
    // this filter
    if (!match) { return; }

    // if the column name isn't a valid member of the schema,
    // skip over it
    let columnNames = _.map(schema._cms_.table.columns, (col) => col.name);
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
