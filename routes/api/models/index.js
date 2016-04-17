'use strict';

const _          = require('underscore');

const Models = require('../../../server/models');
const router = require('express').Router();

const DATA_TYPES = require('../../../server/models/data-types.json');

router.get('/', (req, res) => {
  res.json(Models.schemas);
});

router.get('/:name', (req, res) => {
  res.json(Models.schemas[req.params.name]);
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
