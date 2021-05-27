logFrame = (session_id, kind) => {
  if(kind === 'ping') {
    return {
      idx : '',
      session_id: session_id,
      target: '',
      start_time: '',
      log: [],
      summaryLog: {}
    }
  } else if(kind === 'tracerouter') {
    return {
      idx : '',
      session_id: session_id,
      target: '',
      start_time: '',
      log: [],
    }
  }
}

module.exports = logFrame;