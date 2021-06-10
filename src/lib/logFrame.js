logFrame = (uuid, kind) => {
  if(kind === 'ping') {
    return {
      uuid: uuid,
      address: '',
      start_time: '',
      log: [],
      summaryLog: {}
    }
  } else if(kind === 'tracerouter') {
    return {
      uuid: uuid,
      address: '',
      start_time: '',
      log: [],
    }
  }
}

module.exports = logFrame;