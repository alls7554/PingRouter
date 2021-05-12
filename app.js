require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const session = require('express-session');

const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const { PORT, MONGO_URI, sessionKey } = process.env;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,  useCreateIndex:true})
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));
const pingDBLog = require('./public/javascripts/ping');
const tracerouterDBLog = require('./public/javascripts/tracerouter')

const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const sdb = new sqlite3.Database('./database/log.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.log(err);
  } else {
    console.log('open server db');
  }
});

// const createTimeQuery = `
//   CREATE TABLE time(
//     session_id text,
//     address text,
//     start_time text,
//     end_time text
//   )
//   `;
// const dropQuery2 = `
//   drop TABLE time
// `;
// sdb.serialize(() => {
//   sdb.each(dropQuery2);
//   sdb.each(createTimeQuery);
//   console.log('Reset!!');
// });

let indexRouter = require('./routes/index');
let historyRouter = require('./routes/history');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: sessionKey,
  cookie:{
    // path : cookie의 경로 default “/“
    // httpOnly : 웹서버를 통해서만 cookie 접근할 수 있도록 한다
    // secure : https에서만 cookie 사용할 수 있도록 한다.(HTTPS여야만 작동)
    // maxAge : 만료 시간을 밀리초 단위로 설정
    // expires : 만료 날짜를 GMT 시간으로 설정(maxAge와 동시 등록시 마지막것 사용)
    // domain : 지정한 도메인으로 쿠키값을 저장한다.
    // signed : cookie가 서명되어야 할 지를 결정한다.
    // sameSite : true/false 엄격하게 같은 사이트에서 쿠키를 사용할지.
    path: '/',
    httpOnly: true,
    secure: false
  },
  resave: false,
  saveUninitialized: true,
  store:new SQLiteStore
}));

// router
app.use('/', indexRouter);
app.use('/history', historyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(req)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const ping = require('net-ping');
const Traceroute = require('nodejs-traceroute');
const moment = require('moment');

let options = {
  networkProtocol: ping.NetworkProtocol.IPv4, // IPv4 사용
  packetSize: 64,                             // packet 사이즈 설정
  retries: 1,                                 // 재전송 횟수
  sessionId: (process.pid % 65535),           // 세션 클래스 인스턴스에서 보낸 req와 res 패킷을 식별하는데 사용되는 고유 ID
  timeout: 2000,                              // 제한시간(단위 milliseconds)
  ttl: 128                                    // TTL
}; 

let rtt = {
  cnt : 0,
  min : 100000,   // 어떻게 처리하는게 더 좋을까...
  avg : 0,
  max : 0,
}

let myapp = io.on('connection', (socket) => {

  console.log('user connect');
  
  tmp_id = socket.handshake.headers.cookie;
  tmp = tmp_id.split('=');
  session_id = tmp[1];

  let sessions = ping.createSession(options);
  
  let Time = {
    startTime : '',
    endTime : ''
  }
  let pingdblog = {
    session_id: session_id,
    target: '',
    start_time: '',
    log: [],
    summaryLog: {},
    graph: ''
  }
  let tracerouterdblog = {
    session_id: session_id,
    start_time: '',
    log: [],
  }
  let test;   // setTimeout functiond의 이름
  let ping_check_bool = false,
      tr_check_bool = false;

  socket.on('start', (address) => {
    summarypingLog = deepCopy(rtt);
    ping_check_bool = true, tr_check_bool = true;
    Time.startTime = moment().format();
    myapp.to(socket.id).emit('STARTTIME', Time.startTime);

    pingdblog.target = address;
    pingdblog.start_time = Time.startTime;

    tracerouterdblog.start_time = Time.startTime;

    sdb.run(`INSERT INTO time (session_id, address, start_time) VALUES ('${session_id}', '${address}', '${Time.startTime}')`);

    console.log('PING ' + address +'('+address+'): ' + options.packetSize + ' data bytes');

    test = setTimeout(run = () => {
      sessions.pingHost(address, (error, address, sent, rcvd) => {
        let ms = rcvd - sent;

        // sent : 해당 요청에서 첫번째 핑이 보내졌을 때 특정되는 Date 클래스의 인스턴스
        // rcvd : 요청이 수행됐을 때 특정되는 Date 클래스의 인스턴스
        if(summarypingLog.max < ms) summarypingLog.max = ms;
        if(summarypingLog.min > ms) summarypingLog.min = ms;

        summarypingLog.avg+=ms;

        if(error){
          err = error.toString()
          console.log(address + ': ' + err);
        } else{
          let obj = {
            icmp_seq: summarypingLog.cnt++,
            time: ms
          }
          let avg = (summarypingLog.avg/summarypingLog.cnt).toFixed(3);
          if(ping_check_bool){
            pingdblog.log.push(obj);
            myapp.to(socket.id).emit('pingProcess', address, obj);
            myapp.to(socket.id).emit('pingGraph', obj, avg);
            setTimeout(run, 1000);
          } else return;
        }
      });
    }, 1000);
    try {
      const tracer = new Traceroute();
      tracer
        .on('pid', (pid) => {
            console.log(`pid: ${pid}`);
        })
        .on('destination', (destination) => {
          myapp.to(socket.id).emit('trDestination', destination);
        })
        .on('hop', (hop) => {
          tracerouterdblog.log.push(hop);
          myapp.to(socket.id).emit('trProcess', hop);
        })
        .on('close', (code) => {
          tr_check_bool = false;
          if(!ping_check_bool){
            Time.endTime = moment().format();
            sdb.run(`UPDATE time SET end_time = '${Time.endTime}' WHERE session_id ='${session_id}' AND start_time='${Time.startTime}'`);
          }
          tracerouterdblog.log.push(code);
          tracerouterDBLog.create(tracerouterdblog)
          myapp.to(socket.id).emit('trClose', code);
        });

      tracer.trace(address);
    } catch (ex) {
      console.log(ex);
    }
  });

  socket.on('stop', (imageURL) => {

    // if(!ping_check_bool) {
    //   myapp.to(socket.id).emit('PROHIBIT');
    //   return; 
    // }

    clearTimeout(test);
    
    ping_check_bool = false;

    summarypingLog.avg = (summarypingLog.avg/summarypingLog.cnt).toFixed(3); 

    let obj = {
      cnt : summarypingLog.cnt,
      max : summarypingLog.max,
      avg : summarypingLog.avg,
      min : summarypingLog.min
    }

    console.log(obj);
    myapp.to(socket.id).emit('result', obj);

    pingdblog.summaryLog = obj;
    
    pingdblog.graph = imageURL;
    pingDBLog.create(pingdblog);

    if(!tr_check_bool){
      Time.endTime = moment().format();
      sdb.run(`UPDATE time SET end_time = '${Time.endTime}' WHERE session_id ='${session_id}' AND start_time='${Time.startTime}'`);
    }
  });

  socket.on('disconnect', () =>{
    clearTimeout(test);
    console.log('User Disconnect');
  })
});

server.listen(PORT, function () {
  console.log(`Express server has started on port ${PORT}`);
});

function deepCopy(obj) {
  if (Array.isArray(obj)) return new Array();

  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  let copy = [];
  for (let key in obj) {
    copy[key] = deepCopy(obj[key]);
  }
  return copy;
}

module.exports = app;