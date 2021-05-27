'use strict';

module.exports = (server) => {
  const io = require('socket.io')(server);

  const moment = require('moment');

  const session_id = require('../lib/getSessionId');
  const logFrame = require('../lib/logFrame');
  const deepCopy = require('../lib/deepCopy');
  
  const database = require('./database');

  const Traceroute = require('nodejs-traceroute');
  const ping = require('net-ping');

  // PingTest Option
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
    min : 100000,
    avg : 0,
    max : 0,
  }

  let run;
  let testStart;
  
  let myapp = io.on('connection', async (socket) => {

    console.log('user connect');

    let sessionId = session_id.getSessionId(socket);
    
    let data = await database.sqlite3.find(`SELECT COUNT(idx) as idx FROM time WHERE session_id = '${sessionId}'`);

    let time = {
      startTime : '',
      endTime : ''
    }

    let sessions = ping.createSession(options);

    let ping_check_bool = false,
        tr_check_bool = false;

    let pingdblog,
        tracerouterdblog,
        summarypingLog;

    socket.on('start', (address) => {
      
      time.startTime = moment().format();
      ping_check_bool = true, tr_check_bool = true;
      data[0].idx += 1;
      myapp.to(socket.id).emit('STARTTIME', time.startTime);

      summarypingLog = deepCopy(rtt);
      pingdblog = logFrame(sessionId, 'ping');
      tracerouterdblog = logFrame(sessionId, 'tracerouter');

      pingdblog.idx = data[0].idx,
      pingdblog.target = address,
      pingdblog.start_time = time.startTime;

      tracerouterdblog.idx = data[0].idx,
      tracerouterdblog.target = address,
      tracerouterdblog.start_time = time.startTime;

      // summarypingLog = pingTest.summaryPing();
      // pingdblog = pingTest.pingLog(sessionId, data[0].idx, time.startTime, address);
      // tracerouterdblog = traceRouter.traceRouterLog(sessionId, data[0].idx, time.startTime);
      // pingTest.testStart;
      // traceRouter.traceRouter(address);      

      testStart = setTimeout(run = () => {
        sessions.pingHost(address, (error, address, sent, rcvd) => {
          let ms = rcvd - sent;
    
          // sent : 해당 요청에서 첫번째 핑이 보내졌을 때 특정되는 Date 클래스의 인스턴스
          // rcvd : 요청이 수행됐을 때 특정되는 Date 클래스의 인스턴스
          if(summarypingLog.max < ms) summarypingLog.max = ms;
          if(summarypingLog.min > ms) summarypingLog.min = ms;
    
          summarypingLog.avg+=ms;
          
          if(error){
            if (error instanceof ping.RequestTimedOutError)
              console.log (address + ": Not alive");
            else
              console.log (address + ": " + error.toString ());
            
            sessions.close();
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
              time.endTime = moment().format();
              let sql = `INSERT INTO time (idx, session_id, address, start_time, end_time) VALUES (${data[0].idx}, '${sessionId}', '${address}', '${time.startTime}', '${time.endTime}')`;
              database.sqlite3.save(sql);
            }
            tracerouterdblog.log.push(code);
            database.tracerouterDBLog.create(tracerouterdblog);
            tracerouterdblog = logFrame(sessionId, 'tracerouter');
            myapp.to(socket.id).emit('trClose', code);
          });
    
        tracer.trace(address);
      } catch (ex) {
        console.log(ex);
      }

    });

    socket.on('stop', (address) => {

      clearTimeout(testStart);

      ping_check_bool = false;

      summarypingLog.avg = (summarypingLog.avg/summarypingLog.cnt).toFixed(3); 

      let obj = {
        cnt : summarypingLog.cnt,
        max : summarypingLog.max,
        avg : summarypingLog.avg,
        min : summarypingLog.min
      }

      myapp.to(socket.id).emit('result', obj);

      pingdblog.summaryLog = obj;

      database.pingDBLog.create(pingdblog);

      if(!tr_check_bool){
        time.endTime = moment().format();
        let sql = `INSERT INTO time (idx, session_id, address, start_time, end_time) VALUES (${data[0].idx}, '${sessionId}', '${address}', '${time.startTime}', '${time.endTime}')`;
        database.sqlite3.save(sql);
      }
    });

    socket.on('disconnect', () => {
      clearTimeout(testStart);
      console.log('User Disconnect');
    })
  });

  return io;
}