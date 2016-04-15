'use strict';

const request = require('request');
const router  = require('express').Router();
const path    = require('path');

const API_URL = process.env.ROOT_URL + '/api';

router.get('/', (req, res, next) => {
  let url = API_URL + '/models';
  request.get(url, (err, response, body) => {
    if (err) { return next(err); }

    res.render('models/index', {
      models: JSON.parse(body)
    });
  });
})
.get('/create', (req, res, next) => {
  res.render('models/create');
});

module.exports = router;
