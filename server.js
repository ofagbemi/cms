'use strict';

require('dotenv').config();
require('babel-core/register')({
    presets: ['es2015', 'react']
});
require('isomorphic-fetch');

const express = require('express');
const exphbs  = require('express-handlebars');
const http    = require('http');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const hbs = exphbs.create({
  defaultLayout: 'main',
  partialsDir: 'components',
  handlebars: require('handlebars'),
  helpers: require('./shared/hbs-helpers'),
  extname: '.hbs'
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


app.use(require('./routes'));
app.use('/res', express.static('res'));

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app).listen(port, () => {
  let addr = server.address();
  console.log('Listening at port %d', addr.port);
});
