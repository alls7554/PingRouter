logFrame = (uuid, kind) => {
  if(kind === 'ping') {
    return {
      idx : '',
      uuid: uuid,
      target: '',
      start_time: '',
      log: [],
      summaryLog: {}
    }
  } else if(kind === 'tracerouter') {
    return {
      idx : '',
      uuid: uuid,
      target: '',
      start_time: '',
      log: [],
    }
  }
}

module.exports = logFrame;