'use strict';

module.exports = (server) => {
  const io = require('socket.io')(server);

  const moment = require('moment');

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

  let myapp = io.on('connection', async (socket) => {

    if(process.env.NODE_ENV === 'development')
      console.log('user connect');

    let run;
    let testStart;

    let time = {
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
      ping_check_bool = true; tr_check_bool = true;
      
      summarypingLog = deepCopy(rtt);
      pingdblog = logFrame('ping');
      tracerouterdblog = logFrame('tracerouter');
      
      pingdblog.address = address,
      pingdblog.start_time = time.start_time;


      myapp.to(socket.id).emit('STARTTIME', time.start_time);

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
        let tracer = new Traceroute(address);
        let idx = 0;
        tracer
          .on('pid', (pid) => {
            tracerouterdblog.address = address,
            tracerouterdblog.start_time = time.start_time;
            console.log(`pid: ${pid}`);
          })
          .on('destination', (destination) => {
            if(tr_check_bool){
              myapp.to(socket.id).emit('trDestination', destination);
            }
          })
          .on('hop', (hop) => {
            if(tr_check_bool) {
              tracerouterdblog.log.push(hop);
              myapp.to(socket.id).emit('trProcess', hop);
            }
          })
          .on('close', (code) => {
            if(!ping_check_bool){
              time.end_time = moment().format();
              // time 데이터 저장하기
              database.time.create(time);
            }
            
            if(tr_check_bool){
              tracerouterdblog.log.push(code);
              tracerouterdblog.idx = idx;

              //tracerouter 데이터 저장하기
              database.tracerouter.create(tracerouterdblog);
              
              idx+=1;

              tracerouterdblog = logFrame('tracerouter');
              myapp.to(socket.id).emit('trClose', code);
            }
          }).on('start', () => {
              if(tr_check_bool){
                tracer.trace();
              }  
          });

        tracer.trace();
      } catch (ex) {
        console.log(ex);
      }

    });

    socket.on('stop', () => {

      clearTimeout(testStart);

      ping_check_bool = false, tr_check_bool = false;

      summarypingLog.avg = (summarypingLog.avg/summarypingLog.cnt).toFixed(3); 

      let obj = {
        cnt : summarypingLog.cnt,
        max : summarypingLog.max,
        avg : summarypingLog.avg,
        min : summarypingLog.min
      }

      myapp.to(socket.id).emit('result', obj);

      pingdblog.summaryLog = obj;

      // ping 데이터 저장하기
      database.ping.create(pingdblog);

      if(!tr_check_bool){
        time.end_time = moment().format();
        // 시간 데이터 저장하기
        database.time.create(time);
      }
    });

    socket.on('disconnect', () => {
      clearTimeout(testStart);
      ping_check_bool = false, tr_check_bool = false;
      if(process.env.NODE_ENV === 'development')
        console.log('User Disconnect');
    })
  });

  return io;
}