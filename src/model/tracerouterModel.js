const mongoose = require('../config/mongoDB');

const tracerouterlogSchema = new mongoose.Schema({
  idx : { type: Number },
  uuid: { type: String },
  target: { type: String },
  start_time: { type: String },
  log: { type: Array }
});

let TracerouterLogModel = mongoose.model('tracerouterlog', tracerouterlogSchema);

// Create
tracerouterlogSchema.statics.create = (payload) => {
  const log = new TracerouterLogModel(payload);
  console.log('Save On MongoDB')  
  return log.save();
}

// Read
tracerouterlogSchema.statics.findOneBystartTime = async (start_time) => {
  return await TracerouterLogModel.find({'start_time': start_time});
}

module.exports = mongoose.model('TraceRouterDBLog', tracerouterlogSchema);
