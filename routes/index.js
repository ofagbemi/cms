'use strict';

const router = require('express').Router();

router.use('/api', require('./api'));
router.use('/', require('./app'));

module.exports = router;
