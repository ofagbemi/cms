'use strict';

const router = require('express').Router();

router.use('/api', require('./api'));
router.use('/models', require('./models'));

module.exports = router;
