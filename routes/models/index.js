'use strict';

const _      = require('underscore');
const request = require('request');
const router  = require('express').Router();
const path    = require('path');

const API_URL = process.env.ROOT_URL + '/api';
const DATA_TYPES = require('../../server/models/data-types.json');
const DATA_TYPE_LABELS = _.keys(DATA_TYPES).sort();

router.get('/', (req, res, next) => {
  let url = API_URL + '/models';
  request.get(url, (err, response, body) => {
    if (err) { return next(err); }

    res.render('models/index', {
      models: JSON.parse(body)
    });
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

router.get('/create', (req, res, next) => {
  res.render('models/create', {
    _cms_: {
      dataTypes: DATA_TYPES,
      dataTypeLabels: DATA_TYPE_LABELS
    }
  });
});

module.exports = router;
