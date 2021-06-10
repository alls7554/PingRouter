'use strict';

module.exports = (server) => {
  const io = require('socket.io')(server);

  const moment = require('moment');

  const session_id = require('../lib/getSessionId');
  const logFrame = require('../lib/logFrame');
  const deepCopy = require('../lib/deepCopy');
  const jwt = require('../lib/jwt');

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
    let payload = jwt.checkJWT(sessionId);
    let user_id = payload.user_id
    let data = await database.member.findById(user_id);

    let member_uuid = data.uuid;

    let time = {
      uuid : member_uuid,
      address : '',
      start_time : '',
      end_time : ''
    }

    let sessions = ping.createSession(options);

    let ping_check_bool = false,
        tr_check_bool = false;

    let pingdblog,
        tracerouterdblog,
        summarypingLog;

    socket.on('start', (address) => {

      time.address = address;
      time.start_time = moment().format();
      ping_check_bool = true, tr_check_bool = true;
      data.idx += 1;
      myapp.to(socket.id).emit('STARTTIME', time.start_time);

      summarypingLog = deepCopy(rtt);
      pingdblog = logFrame(member_uuid, 'ping');
      tracerouterdblog = logFrame(member_uuid, 'tracerouter');

      pingdblog.address = address,
      pingdblog.start_time = time.start_time;

      tracerouterdblog.address = address,
      tracerouterdblog.start_time = time.start_time;

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
              time.end_time = moment().format();
              database.time.create(time);
            }
            tracerouterdblog.log.push(code);

            database.tracerouter.create(tracerouterdblog);

            tracerouterdblog = logFrame(member_uuid, 'tracerouter');
            myapp.to(socket.id).emit('trClose', code);
          });

        tracer.trace(address);
      } catch (ex) {
        console.log(ex);
      }

    });

    socket.on('stop', () => {

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

      database.ping.create(pingdblog);

      database.ping.create(pingdblog);

      if(!tr_check_bool){
        time.end_time = moment().format();
        database.time.create(time);
      }
    });

    socket.on('disconnect', () => {
      clearTimeout(testStart);
      console.log('User Disconnect');
    })
  });

  return io;
}