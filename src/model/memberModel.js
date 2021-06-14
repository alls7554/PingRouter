const mongoose = require('../config/mongoDB');
const AutoIncrement = require('../lib/auto-id-setter');

const memberLogSchema = new mongoose.Schema({
  idx : { type : Number, default : 0 },
  uuid : { type : String, unique: true },
  user_id : { type : String, required: true, min: 2, max: 8 },
  pwd : { type : String,  required: true }
});

AutoIncrement(memberLogSchema, mongoose, 'memberLog', 'idx');

let memberLogModel = mongoose.model('memberLog', memberLogSchema);

//CREATE
let create = (payload) => {
  let data = new memberLogModel(payload);
  data.save(() => {
    if(process.env.NODE_ENV === 'development')
      console.log('Save On Member');
  });
}

//READ
let findById = async(user_id) => {
  return await memberLogModel.findOne({'user_id':user_id});
}

module.exports = { memberLogModel, create, findById };