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
  let url = API_URL + '/models';
  request.get(url, (err, response, body) => {
    if (err) { return next(err); }

    res.render('models/index', {
      models: JSON.parse(body)
    });
  });
});

router.get('/create', (req, res, next) => {
  res.render('models/create', {
    _cms_: {
      dataTypes: DATA_TYPES,
      dataTypeLabels: DATA_TYPE_LABELS
    }
  });
});

router.get('/:model/:page?', (req, res, next) => {
  let page = req.params.page || 1;

  let query = qs.stringify({
    page: page,
    limit: ROW_LIMIT
  });

  // rows, schema
  async.parallel({
    rows: (callback) => {
      let url = `${API_URL}/models/${req.params.model}?${query}`;
      request.get(url, (err, response, body) => {
        if (err) { return callback(err); }

        let rows = JSON.parse(body);
        return callback(null, rows);
      });
    },
    schema: (callback) => {
      let url = `${API_URL}/models/schemas/${req.params.model}`;
      request.get(url, (err, response, body) => {
        if (err) { return callback(err); }

        let schema = JSON.parse(body);
        return callback(null, schema);
      });
    }
  }, (err, data) => {
    if (err) { return next(err); }
    return res.render('models/rows', data);
  });
});

router.post('/', (req, res, next) => {
  let url = API_URL + '/models';
  request.post({
    url: url,
    form: req.body
  }, (err, response, body) => {
    if (err) { return next(err); }

    res.json({
      redirectUrl: '/models'
    });
  });
});

module.exports = router;
