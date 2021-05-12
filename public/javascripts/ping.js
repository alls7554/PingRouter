const mongoose = require('mongoose');

const pinglogSchema = new mongoose.Schema({
  session_id: { type: String },
  target: { type: String },
  start_time: { type: String },
  log: { type: Array },
  summaryLog : { type: Object },
  graph: { type: String}
});

var Pinglogmodel = mongoose.model('pinglog', pinglogSchema);

// Create
pinglogSchema.statics.create = (payload) => {
  const log = new Pinglogmodel(payload);
  // log.start_time = currentTime(log.start_time);

  console.log('Save On MongoDB')
  return log.save();
}

// Read
pinglogSchema.statics.findOneBystartTime = async (start_time) => {
  return await Pinglogmodel.find({'start_time' : start_time});
}

module.exports = mongoose.model('PingDBLog', pinglogSchema);