downloadReady = (pingLogs, pingResult, trLogs) => {
  let data = {
    pingLog : [],
      trLog : []
  }

  data.pingLog.push(['Target', 'icmp_seq', 'Time'])
  for(idx in pingLogs) {
    let log = pingLogs[idx].innerText;
    if(log){
      tmp = log.replace(/ /g, '');
      tmp = tmp.split(/:icmp_seq=|time=/g);
      data.pingLog.push(tmp);
    }
  }

  data.pingLog.push(pingResult.title)
  data.pingLog.push(pingResult.packet)
  data.pingLog.push(pingResult.rtt)

  data.trLog.push(['Hops', 'Target', 'Time'])
  for (idx in trLogs) {
    let log = trLogs[idx].innerText;
    if(log){
      tmp = log.replace(/ ms/g, 'ms')
      tmp = tmp.split(/ /g);
      data.trLog.push(tmp);
    }
  }

  return data;
}
