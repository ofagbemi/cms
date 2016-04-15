'use strict';

require('dotenv').config();

const express = require('express');
const exphbs  = require('express-handlebars');
const http    = require('http');

const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  partialsDir: 'components',
  handlebars: require('handlebars'),
  extname: '.hbs'
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(require('./routes'));
app.use('/res', express.static('res'));

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app).listen(port, () => {
  let addr = server.address();
  console.log('Listeing at port %d', addr.port);
});
