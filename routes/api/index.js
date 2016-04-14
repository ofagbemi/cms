'use strict';

const models = require('./models');
const router = require('express').Router();

router.get('/', (req, res, next) => {
  return next();
});

module.exports = router;
