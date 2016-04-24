'use strict';

const multiparty = require('multiparty');
const sanitize = require('sanitize-filename');
const pathJoin = require('path').join;
const async  = require('async');
const router = require('express').Router();
const upload = require('../../../server/upload').upload;
const resave = require('../../../server/upload').resave;

function getFileStreamCallback(form) {
  return (callback) => {
    form.on('part', (part) => {
      if (part.filename) {
        return callback(part);
      }
    });
  };
}

function getPathStreamCallback(form) {
  return (callback) => {
    form.on('part', (part) => {
      if (!part.filename) {
        let buff = [];
        part.on('data', (chunk) => {
          buff.push(chunk);
        }).on('end', () => {
          let buffer = Buffer.concat(buff);
          let path   = String(buffer);
          return callback(path);
        });
      }
    });
  };
}

router.post('/', (req, res, next) => {
  let form = new multiparty.Form();
  upload(
    getFileStreamCallback(form),
    getPathStreamCallback(form),
    (err, result) => {
      if (err) { return  next(err); }
      return res.json({
        msg: `Successfully uploaded file '${result.fullPath}'`
      });
    }
  );
  form.parse(req);
});

module.exports = router;
