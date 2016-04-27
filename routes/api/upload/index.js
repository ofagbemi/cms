'use strict';

const sanitizeFilename = require('sanitize-filename');
const multiparty = require('multiparty');
const pathJoin   = require('path').join;
const _      = require('underscore');
const async  = require('async');
const trim   = require('underscore.string/trim');
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
          let sanitizedPath = sanitizePath(path);
          return callback(path);
        });
      }
    });
  };
}

function sanitizePath(path) {

  let pathArr = path.split(/[\/\\]/);
  pathArr = _.compact(_.map(pathArr, (part) => {
    let sanitized = sanitizeFilename(part);

    // get rid of empty strings
    if (!trim(sanitized)) { return null; }
    return sanitized;
  }));

  return pathArr.join('/');
}

router.post('/', (req, res, next) => {
  let form = new multiparty.Form();
  upload(
    getFileStreamCallback(form),
    getPathStreamCallback(form),
    (err, result) => {
      if (err) { return  next(err); }
      return res.json({
        msg: `Successfully uploaded file '${result.path}'`,
        path: result.path
      });
    }
  );
  form.parse(req);
});

module.exports = router;
