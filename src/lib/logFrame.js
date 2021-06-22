logFrame = (kind) => {
  if(kind === 'ping') {
    return {
      address: '',
      start_time: '',
      log: [],
      summaryLog: {}
    }
  } else if(kind === 'tracerouter') {
    return {
      idx: '',
      address: '',
      start_time: '',
      log: [],
    }
  }
}

module.exports = logFrame;