const mongoose = require('../config/mongoDB');
const AutoIncrement = require('../lib/auto-id-setter');

const tracerouterLogSchema = new mongoose.Schema({
  idx : { type: Number },
  uuid: { type: String, required: true },
  address: { type: String },
  start_time: { type: String },
  log: { type: Array }
});

AutoIncrement(tracerouterLogSchema, mongoose, 'tracerouterLog', 'idx');

let tracerouterLogModel = mongoose.model('tracerouterlog', tracerouterLogSchema);

let create = (payload) => {
  let data = new tracerouterLogModel(payload);
  data.save(() => {
    if(process.env.NODE_ENV === 'development')
      console.log('Save On TraceRouter');
  });
}

let findBystartTime = async (startTime) => {
  return await tracerouterLogModel.findOne({'start_time': startTime});
}

module.exports = { tracerouterLogModel, create, findBystartTime }
