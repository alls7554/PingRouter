const mongoose = require('../config/mongoDB');

const pinglogSchema = new mongoose.Schema({
  idx : { type: Number },
  session_id: { type: String },
  target: { type: String },
  start_time: { type: String },
  log: { type: Array },
  summaryLog : { type: Object }
});

let Pinglogmodel = mongoose.model('pinglog', pinglogSchema);

// Create
pinglogSchema.statics.create = (payload) => {
  const log = new Pinglogmodel(payload);

  console.log('Save On MongoDB')
  return log.save();
}

// Read
pinglogSchema.statics.findOneBystartTime = async (start_time) => {
  return await Pinglogmodel.find({'start_time' : start_time});
}

module.exports = mongoose.model('PingDBLog', pinglogSchema);