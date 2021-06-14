const mongoose = require('../config/mongoDB');
const AutoIncrement = require('../lib/auto-id-setter');

const pingLogSchema = new mongoose.Schema({
  idx : { type: Number },
  uuid: { type: String, required: true},
  address: { type: String },
  start_time: { type: String },
  log: { type: Array },
  summaryLog : { type: Object }
});

AutoIncrement(pingLogSchema, mongoose, 'pingLog', 'idx');

let pingLogModel = mongoose.model('pingLog', pingLogSchema);

let create = (payload) => {
  let data = new pingLogModel(payload);
  data.save(() => {
    if(process.env.NODE_ENV === 'development')
      console.log('Save On Ping');
  });
}

let findBystartTime = async (startTime) => {
  return await pingLogModel.findOne({'start_time': startTime});
}

module.exports = { pingLogModel, create, findBystartTime }