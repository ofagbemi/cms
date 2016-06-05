'use strict';

const router = require('express').Router();

router.get('/', (req, res, next) => {
  return next();
})
.use('/models', require('./models'))
.use('/upload', require('./upload'))
.use((err, req, res, next) => {
  return res
    .status(err.statusCode || 500)
    .json(err);
});

module.exports = router;
