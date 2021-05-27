'use strict';
process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

console.log(process.env.NODE_ENV)
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const session = require('express-session');
const createError = require('http-errors');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);

// app setting
if(process.env.NODE_ENV === 'development'){
  const logger = require('morgan');
  app.use(logger('dev'));
}

// view engine setup
app.use(express.static(path.join(__dirname, 'src/public')));
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.sessionKey,
  cookie:{
    // path : cookie의 경로 default “/“
    // httpOnly : 웹서버를 통해서만 cookie에 접근할 수 있도록 한다
    // secure : https에서만 cookie 사용할 수 있도록 한다.(HTTPS여야만 작동)
    // maxAge : 만료 시간을 밀리초 단위로 설정
    // expires : 만료 날짜를 GMT 시간으로 설정(maxAge와 동시 등록시 마지막 것 사용)
    // domain : 지정한 도메인으로 쿠키값을 저장한다.
    // signed : cookie가 서명되어야 할 지를 결정한다.
    // sameSite : true/false 엄격하게 같은 사이트에서 쿠키를 사용할지.
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: 365 * 24 * 60 * 60 * 1000    // 1years
  },
  rolling: true,
  resave: false,
  saveUninitialized: true,
  store:new SQLiteStore
}));

// router
const indexRouter = require('./src/routes/index');
const historyRouter = require('./src/routes/history');
app.use('/', indexRouter);
app.use('/history', historyRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // console.log(req)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;