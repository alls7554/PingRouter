

const Traceroute = require('nodejs-traceroute');
const logFrame = require('../lib/logFrame');

let tracerouterdblog;

exports.traceRouterLog = (session_id, idx, time ) => {
  tracerouterdblog = logFrame(session_id, 'tracerouter');

  tracerouterdblog.idx = idx;
  tracerouterdblog.start_time = time;

  return tracerouterdblog;
}

exports.traceRouter = (address) => {
  try {
    const tracer = new Traceroute();
    tracer
      .on('pid', (pid) => {
        console.log(`pid: ${pid}`);
      })
      .on('destination', (destination) => {
        // myapp.to(socket.id).emit('trDestination', destination);
        return destination;
      })
      .on('hop', (hop) => {
        tracerouterdblog.log.push(hop);
        // myapp.to(socket.id).emit('trProcess', hop);
        return hop
      })
      .on('close', (code) => {
        tr_check_bool = false;
        if(!ping_check_bool){
          Time.endTime = moment().format();
          let sql = `INSERT INTO time (idx, session_id, address, start_time, end_time) VALUES (${data[0].idx}, '${session_id}', '${address}', '${Time.startTime}', '${Time.endTime}')`;
          sqlite3.save(sql);
        }
        tracerouterdblog.log.push(code);
        database.tracerouterDBLog.create(tracerouterdblog);
        tracerouterdblog = logFrame(session_id, 'tracerouter');
        // myapp.to(socket.id).emit('trClose', code);
        return code, tr_check_bool;
      });

    tracer.trace(address);
  } catch (ex) {
    console.log(ex);
  }
}