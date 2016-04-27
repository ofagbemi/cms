'use strict';

const _      = require('underscore');
const fs     = require('fs');
const ssh2   = require('ssh2');
const path   = require('path');
const sha256 = require('sha256');
const async  = require('async');
const inherits = require('inherits');
const startsWith = require('underscore.string/startsWith');
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

      let relPath = path.join(
        process.env.REL_UPLOADS_DIR,
        result.destPath,
        result.file.filename
      );

      let tmpPath = result.file.tmpPath;

      createDirectoryTree(result.destPath, sftp).then((directory) => {
        destructiveRename(sftp, tmpPath, fullPath).then(() => {
          cleanupTmpFile(sftp, tmpPath).then(() => {
            return cb(null, { path: relPath });
          }).catch((err) => {
            console.log(`Failed to clean up tmp file at ${tmpPath}.\n` +
                        `Returning success anyway...`);
            return cb(null, {
              path: relPath,
              info: `Failed to clean up tmp file at ${tmpPath}`
            });
          });
        }).catch((err) => {
          let msg = `Error renaming file ${tmpPath} to ${fullPath}`;
          return cb(new Error(msg));
        });
      }).catch((err) => {
        let msg = `Error creating directory tree '${result.destPath}' ${err}`;
        return cb(new Error(msg));
      });
    });
  });
};

function destructiveRename(sftp, src, dest) {
  let readStream = sftp.createReadStream(src);
  let writeStream = sftp.createWriteStream(dest);

  return new Promise((resolve, reject) => {
    readStream.on('end', () => {
      resolve();
    }).on('error', (err) => {
      reject(err);
    });
    readStream.pipe(writeStream);
  });
}

function cleanupTmpFile(sftp, tmpPath) {
  tmpPath = startsWith(tmpPath, process.env.UPLOADS_TMP_DIR) ?
    tmpPath : path.join(process.env.UPLOADS_TMP_DIR, tmpPath);
  return new Promise((resolve, reject) => {
    sftp.unlink(tmpPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * @param {string} destPath - the directory relative to the HCI server's
 * uploads directory
 * @param {SFTPStream} sftp
 * @param {function} callback
 * @returns {Promise}
 */
function createDirectoryTree(destPath, sftp, callback) {
  let p = destPath.split('/');

  // join the root of the relative path with the full path
  // to the uploads directory
  let root = path.join(process.env.UPLOADS_DIR, p.shift());
  let fns = _.map(p, (part) => {
    return (createdDirectory, cb) => {
      let pathToCreate = path.join(createdDirectory, part);
      sftp.mkdir(pathToCreate, (err) => {
        // assume if the error code is 4 that the directory
        // already existed
        if (!err || err.code === 4) {
          return cb(null, pathToCreate);
        } else {
          return cb(err);
        }
      });
    };
  });

  // different function for the root directory
  fns.unshift((cb) => {
    sftp.mkdir(root, (err) => {
      // assume if the error code is 4 that the directory
      // already existed
      if (!err || err.code === 4) {
        return cb(null, root);
      } else {
        return cb(err);
      }
    });
  });


  return new Promise((resolve, reject) => {
    async.waterfall(fns, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

let exp = new Uploader();
/**
 * @param {function} fileCallbackReceiver - gets passed a callback that it
 * should pass a stream to
 * @param {function} pathCallbackReceiver - gets passed a callback that it
 * should pass a stream or string that yields a destination directory to
 * NOTE: any API that calls this should check the passed in path for safety
 * @param {function} callback gets passed `err` and object with `fullPath`
 * member
 */
exports.upload = function(fileCallbackReceiver, pathCallbackReceiver, callback) {
  return exp.upload(fileCallbackReceiver, pathCallbackReceiver, callback);
};
