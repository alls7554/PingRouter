const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = 3000;

const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');

let indexRouter = require('./routes/index');
let downloadRouter = require('./routes/download');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/download', downloadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const ping = require('net-ping');
const Traceroute = require('nodejs-traceroute');
const moment = require('moment');

const xlsx = require('xlsx');

let pingLog = {
  target : '',
  errLog : [],
  log : []
};
let trLog = {
  target: '',
  errLog : [],
  log : []
};

let options = {
  networkProtocol: ping.NetworkProtocol.IPv4, // IPv4 사용
  packetSize: 64,                             // packet 사이즈 설정
  retries: 1,                                 // 재전송 횟수
  sessionId: (process.pid % 65535),           // 세션 클래스 인스턴스에서 보낸 req와 res 패킷을 식별하는데 사용되는 고유 ID
  timeout: 2000,                              // 제한시간(단위 milliseconds)
  ttl: 128                                    // TTL
};

let test;

// pingtest Time 
let pingTime = {
  start_Time: '',
  check_Time: [],
  stop_Time: ''
};
let check_bool = false;

let myapp = io.on('connection', (socket) => {
  myapp.to(socket.id).emit('URID', socket.id);
  console.log('user connect');

  let session = ping.createSession(options);
  let target;
  let rtt = {
    cnt : 0,
    min : 100000,
    avg : 0,
    max : 0,
  }

  socket.on('start', (address) => {
    target = address;
    pingLog.target, trLog.target = address;
    pingTime.start_Time = moment().format();
    check_bool = true;
    console.log('PING ' + target +'('+target+'): ' + options.packetSize + ' data bytes');
    rtt = {
      cnt : 0,
      min : 100000,
      avg : 0,
      max : 0,
    }
    test = setTimeout(run = () => {
      chkTime = moment().format();
      pingTime.check_Time.push(chkTime);
        session.pingHost(target, (error, target, sent, rcvd) => {
          let ms = rcvd - sent;
          // sent : 해당 요청에서 첫번째 핑이 보내졌을 때 특정되는 Date 클래스의 인스턴스
          // rcvd : 요청이 수행됐을 때 특정되는 Date 클래스의 인스턴스
          if(rtt.max < ms) rtt.max = ms;
          if(rtt.min > ms) rtt.min = ms;
  
          rtt.avg+=ms;

          if(error){
            err = error.toString()
            console.log(target + ': ' + err);
            pingLog.errLog.push({err, chkTime});
          } else{
            let obj = {
              address: target,
              icmp_seq: rtt.cnt++,
              time: ms
            }
            let avg = (rtt.avg/rtt.cnt).toFixed(3);
            if(check_bool){
              pingLog.log.push({obj, chkTime});
              myapp.to(socket.id).emit('pingProcess', obj);
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
          chkTime = moment().format();
          pingLog.log.push({hop, chkTime});
          myapp.to(socket.id).emit('trProcess', hop);
        })
        .on('close', (code) => {
          myapp.to(socket.id).emit('trClose', code);
        });

      tracer.trace(target);
    } catch (ex) {
      pingLog.log.push({hop, chkTime});
      console.log(ex);
    }
  });

  socket.on('stop', () => {
    clearTimeout(test);
    check_bool = false;
    obj = {
      cnt : rtt.cnt,
      max : rtt.max,
      avg : (rtt.avg/rtt.cnt).toFixed(3),
      min : rtt.min
    }
    myapp.to(socket.id).emit('result', obj);
  });

  socket.on('SAVE', (data) => {

    let pingLogs = [],
        trLogs = [];
    console.log(data)
    for(idx in data.pingLog){
      pingLogs.push(data.pingLog[idx]);
    }

    for(idx in data.trLog){
      trLogs.push(data.trLog[idx]);
    }

    const book = xlsx.utils.book_new();
    const writePingLog = xlsx.utils.json_to_sheet( pingLogs, {skipHeader:true});
    const writeTrLog = xlsx.utils.json_to_sheet( trLogs, {skipHeader:true});

    xlsx.utils.book_append_sheet( book, writePingLog, "PINGLOG" );
    xlsx.utils.book_append_sheet( book, writeTrLog, "TRACEROUTELOG" );
    xlsx.writeFile(book, `${socket.id}.xlsx`);

  });

  socket.on('disconnect', () =>{
    clearTimeout(test);
    console.log('User Disconnect');
  })

});


server.listen(port, function () {
  console.log(`Express server has started on port ${port}`);
});


module.exports = app;
