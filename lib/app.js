const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const winston = require('../config/winston');
require('dotenv').config();

// setup the logger for morgan and winston
app.use(morgan('combined', { stream: winston.stream }));

//Enable cors 
app.use(cors());

app.get('/', function(req, res) {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Logging World!</h1>');
});

exports.app = app;