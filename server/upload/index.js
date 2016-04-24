'use strict';

const _      = require('underscore');
const fs     = require('fs');
const ssh2   = require('ssh2');
const path   = require('path');
const sha256 = require('sha256');
const async = require('async');
const inherits = require('inherits');
const randomstring = require('randomstring');
const EventEmitter = require('events').EventEmitter;

function Uploader() {
  EventEmitter.call(this);
}
inherits(Uploader, EventEmitter);

Uploader.prototype._connect = function(callback) {
  let connection = new ssh2.Client();
  connection.on('ready', () => {
    connection.sftp(callback);
  }).connect({
    host: process.env.SSH_HOST,
    port: process.env.SSH_SFTP_PORT,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASS
  });
  return connection;
};

Uploader.prototype.upload = function(fileStreamCallback, pathStreamCallback, cb) {
  cb = cb || _.noop;

  async.parallel({
    // Start by streaming the file into a temp file straight into the
    // uploads directory
    file: (callback) => {
      fileStreamCallback((filePart) => {
        let connection = this._connect((err, sftp) => {

          if (err) { return callback(err); }

          // generate a temporary filename -- high enough entropy
          // salt...
          let salt = randomstring.generate(8);
          let tmpFilename = sha256(String(Date.now()) + salt);
          let tmpPath = path.join(process.env.UPLOADS_TMP_DIR, tmpFilename);

          // create the write stream over sftp
          let writeStream = sftp.createWriteStream(tmpPath);
          filePart.on('end', () => {
            // parallel callback -- we have what we need
            return callback(null, {
              tmpPath: tmpPath,
              filename: filePart.filename
            });
          }).on('error', (err) => {
            return callback(err);
          });
          filePart.pipe(writeStream);
        });
      });
    },

    destPath: (callback) => {
      // now get the location for the final
      // destination directory
      pathStreamCallback((pathStream) => {
        // if this is a string, just go ahead and pass it back to the
        // callback
        if (_.isString(pathStream)) { return callback(null, pathStream); }

        let buff = [];
        pathStream.on('data', (chunk) => {
          buff.push(chunk);
        }).on('end', () => {
          let buffer = Buffer.concat(buff);

          // join relative path to the uploads directory
          // NOTE: makes safety assumptions about the passed in
          // path -- any API that calls this should sanitize paths
          // ahead of time
          let p = path.join(process.env.UPLOADS_DIR, String(buffer));
          return callback(null, p);
        }).on('error', (err) => {
          return callback(err);
        });
      });
    }
  }, (err, result) => {
    if (err) { return cb(err); }

    // connect again to move the file to its final
    // destination
    let connection = this._connect((err, sftp) => {

      if (err) { return cb(err); }

      let fullPath = path.join(
        process.env.UPLOADS_DIR,
        result.destPath,
        result.file.filename);
      sftp.rename(result.file.tmpPath, fullPath, (err) => {
        if (err) {
          let msg = `error renaming file ${result.file.tmpPath} to ${fullPath}`;
          return cb(new Error(msg));
        }
        return cb(null, { fullPath: fullPath });
      });
    });
  });
};

let exp = new Uploader();
/**
 * @param {function} fileCallback - should pass a stream to the caller
 * @param {function} pathCallback - should pass a stream or string to the caller
 * that yields a destination directory
 * NOTE: any API that calls this should check the passed in path for safety
 * @param {function} callback gets passed `err` and object with `fullPath`
 * member
 */
exports.upload = function(fileCallback, pathCallback, callback) {
  return exp.upload(fileCallback, pathCallback, callback);
};
