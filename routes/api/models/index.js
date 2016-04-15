const _ = require('underscore');

const Models = require('../../../server/models');
const router = require('express').Router();

router.get('/', (req, res) => {
  console.log(Models);
});

module.exports = router;
