'use strict';
process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'development' ) ? 'development' : 'production';
console.log(process.env.NODE_ENV)

const express = require('express');
const exp = express();
const dotenv = require('dotenv').config();
const createError = require('http-errors');
const path = require('path');

const cookieParser = require('cookie-parser');
const ejs = require('ejs');

// app setting
if(process.env.NODE_ENV === 'development'){
  const logger = require('morgan');
  exp.use(logger('dev'));
}

let staticPath = path.join(process.cwd(), 'myapp/src');
// view engine setup
if(process.env.NODE_ENV === 'production'){
  exp.use(express.static(path.join(staticPath, 'public')));
  exp.set('views', path.join(staticPath, 'views'));
}
if(process.env.NODE_ENV !== 'production'){
  exp.use(express.static(path.join(__dirname, 'src/public')));
  exp.set('views', path.join(__dirname, 'src/views'));
}
exp.set('view engine', 'ejs');

exp.use(express.json());
exp.use(express.urlencoded({ extended: true }));
exp.use(cookieParser());

// router
const indexRouter = require('./src/routes/index');
const registerRouter = require('./src/routes/register');
const mainRouter = require('./src/routes/main');
const historyRouter = require('./src/routes/history');
exp.use('/', indexRouter);
exp.use('/register', registerRouter);
exp.use('/main', mainRouter);
exp.use('/history', historyRouter);

// catch 404 and forward to error handler
exp.use((req, res, next) => {
  next(createError(404));
});

// error handler
exp.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err.message)
  res.locals.error = req.exp.get('env') === 'development' ? err : {};
  // console.log(req)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = exp;