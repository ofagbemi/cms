'use strict';

const _         = require('underscore');
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const tunnel    = require('tunnel-ssh');
const pascalize = require('uppercamelcase');

let server = tunnel({
  host: process.env.SSH_HOST,
  dstPort: process.env.SSH_PORT,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASS
}, (err, result) => {

  if (err) throw err;

  let sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS, {
    host: '127.0.0.1',
    dialect: 'mysql'
  });

  loadModels(sequelize);
});

/**
 * Synchronously loads each of the models defined in the
 * lib folder
 */
function loadModels(sequelize) {
  var files = fs.readdirSync(path.join(__dirname, '/lib'));
  for (let file of files) {
    let name = file.replace(/\.js$/, '');
    let filePath = path.join(__dirname, '/lib', name);
    var model = sequelize.import(filePath);
    model.sync();

    // export the model from the models package
    exports[pascalize(name)] = model;
  }
}
