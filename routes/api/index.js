'use strict';

const router = require('express').Router();

router.get('/', (req, res, next) => {
  return next();
})
.use('/models', require('./models'));

module.exports = router;
