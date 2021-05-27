

const ping = require('net-ping');

const logFrame = require('../lib/logFrame');
const deepCopy = require('../lib/deepCopy');

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
let testStart;
let run;
let pingdblog;
let summarypingLog = deepCopy(rtt);
let sessions = ping.createSession(options);


exports.pingLog = (session_id, idx, time, target ) => {
  pingdblog = logFrame(session_id, 'ping');

  pingdblog.idx = idx,
  pingdblog.target = target,
  pingdblog.start_time = time;

  return pingdblog;
}

exports.summaryPing = () => {
  summarypingLog = deepCopy(rtt);
  return summarypingLog;
}

exports.testStart = (address) => setTimeout(run = (address) => {
    sessions.pingHost(address, (error, address, sent, rcvd) => {
      let ms = rcvd - sent;

      // sent : 해당 요청에서 첫번째 핑이 보내졌을 때 특정되는 Date 클래스의 인스턴스
      // rcvd : 요청이 수행됐을 때 특정되는 Date 클래스의 인스턴스
      if(summarypingLog.max < ms) summarypingLog.max = ms;
      if(summarypingLog.min > ms) summarypingLog.min = ms;

      summarypingLog.avg+=ms;
      
      if(error){
        if (error instanceof ping.RequestTimedOutError)
          console.log (target + ": Not alive");
        else
          console.log (target + ": " + error.toString ());
        
        sessions.close ();
      } else{
        let obj = {
          icmp_seq: summarypingLog.cnt++,
          time: ms
        }
        let avg = (summarypingLog.avg/summarypingLog.cnt).toFixed(3);
        
        if(ping_check_bool){
          pingdblog.log.push(obj);
          myapp.to(socket.id).emit('pingProcess', pingdblog.target, obj);
          myapp.to(socket.id).emit('pingGraph', obj, avg);
          setTimeout(run, 1000);
        } else return;
      }
    });
  }, 1000);

exports.stopPingTest = () => {
  clearTimeout(testStart);
}