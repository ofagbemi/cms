const _ = require('underscore');

const Models = require('../../../server/models');
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json(Models.schemas);
});

module.exports = router;
