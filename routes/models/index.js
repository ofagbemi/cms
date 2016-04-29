'use strict';

const _       = require('underscore');
const async   = require('async');
const request = require('request');
const router  = require('express').Router();
const path    = require('path');
const qs      = require('querystring');

const API_URL = process.env.ROOT_URL + '/api';
const DATA_TYPES = require('../../server/models/data-types.json');
const DATA_TYPE_LABELS = _.keys(DATA_TYPES).sort();

const ROW_LIMIT = 20;

router.get('/', (req, res, next) => {
  let url = API_URL + '/models/schemas';
  request.get(url, (err, response, body) => {
    if (err) { return next(err); }

    res.render('models/index', {
      models: JSON.parse(body)
    });
  });
});

router.get('/create', (req, res, next) => {
  let url = `${API_URL}/models/schemas`;
  request.get(url, (err, response, body) => {
    if (err) { return next(err); }

    let json = JSON.parse(body);
    let models = _.values(json).sort((a, b) => {
      return a.displayName.localeCompare(b.displayName);
    });

    res.render('models/create', {
      models: models,
      dataTypes: DATA_TYPES,
      dataTypeLabels: DATA_TYPE_LABELS
    });
  });
});

router.get('/:model/create', (req, res, next) => {
  let modelName = req.params.model;
  getLoadSchemaParallelFn(modelName)((err, schema) => {
    if (err) { return next(err); }
    res.render('models/row/edit', {
      schema: schema,
      createMode: true
    });
  });
});

router.post('/:model', (req, res, next) => {
  let modelName = req.params.model;
  let url = `${API_URL}/models/${modelName}`;

  request.post({url: url, form: req.body}, (err, response, body) => {
    if (err) { return next(err); }
    return res.json(_.extend(JSON.parse(body), {
      redirectUrl: `/models/${modelName}`
    }));
  });
});

router.get('/:model/row/:id', (req, res, next) => {
  let id = req.params.id;
  let modelName = req.params.model;
  // row, schema
  async.parallel({
    row: (callback) => {
      let url = `${API_URL}/models/${modelName}/row/${id}`;
      request.get(url, (err, response, body) => {
        if (err) { return callback(err); }
        return callback(null, JSON.parse(body));
      });
    },
    schema: getLoadSchemaParallelFn(modelName)
  }, (err, data) => {
    if (err) { return next(err); }
    return res.render('models/row/edit', data);
  });
});

router.put('/:model/row/:id', (req, res, next) => {
  let id = req.params.id;
  let modelName = req.params.model;


  let url = `${API_URL}/models/${modelName}/row/${id}`;
  request.put({url: url, form: req.body}, (err, response, body) => {
    if (err) { return next(err); }
    return res.json(_.extend(JSON.parse(body), {
      redirectUrl: `/models/${modelName}`
    }));
  });
});

router.get('/:model/:page?', (req, res, next) => {
  let page = req.params.page || 1;
  let query = qs.stringify({
    page: page,
    limit: ROW_LIMIT
  });

  let modelName = req.params.model;

  // rows, schema
  async.parallel({
    rows: (callback) => {
      let url = `${API_URL}/models/${modelName}?${query}`;
      request.get(url, (err, response, body) => {
        if (err) { return callback(err); }

        let rows = JSON.parse(body);
        return callback(null, rows);
      });
    },
    schema: getLoadSchemaParallelFn(modelName)
  }, (err, data) => {
    if (err) { return next(err); }
    return res.render('models/rows', data);
  });
});

router.post('/', (req, res, next) => {
  let url = `${API_URL}/models`;
  request.post({ url: url, form: req.body }, (err, response, body) => {
    if (err) { return next(err); }
    res.json({
      redirectUrl: '/models'
    });
  });
});

function getLoadSchemaParallelFn(schema) {
  return (callback) => {
    let url = `${API_URL}/models/schemas/${schema}`;
    request.get(url, (err, response, body) => {
      if (err) { return callback(err); }

      let schema = JSON.parse(body);
      return callback(null, schema);
    });
  };
}

module.exports = router;
