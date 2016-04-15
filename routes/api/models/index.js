'use strict';

const _ = require('underscore');

const Models = require('../../../server/models');
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json(Models.schemas);
})
.get('/:name', (req, res) => {
  res.json(Models.schemas[req.params.name]);
});

module.exports = router;
