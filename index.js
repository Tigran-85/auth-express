require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const start = require('./config/database');
const router = require('./router');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', router);

start(app);

