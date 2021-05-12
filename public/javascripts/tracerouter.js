const mongoose = require('mongoose');

const tracerouterlogSchema = new mongoose.Schema({
  session_id: { type: String },
  start_time: { type: String },
  log: { type: Array}
});

var TracerouterLogModel = mongoose.model('tracerouterlog', tracerouterlogSchema);

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
