const assert = require('assert');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv').config();

assert(process.env.JWT_SECRET, 'JWT_SECRET environment variable must be provided')

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const connectDB = require('./utils/mongodb');
connectDB();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json(err)
})

module.exports = app;
