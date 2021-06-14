const mongoose = require('../config/mongoDB');
const AutoIncrement = require('../lib/auto-id-setter');

const timeLogSchema = new mongoose.Schema({
  idx : { type : Number },
  uuid : { type : String }, 
  address : { type : String },
  start_time : { type : String },
  end_time : { type : String }
});

AutoIncrement(timeLogSchema, mongoose, 'timeLog', 'idx');

let timeLogModel = mongoose.model('timeLog', timeLogSchema);

// Create
let create = (payload) => {
  const data = new timeLogModel(payload);
  
  return data.save(() => {
    if(process.env.NODE_ENV === 'development')
      console.log('Save On Time');
  });
}

// Read
let findAll = async (uuid) => {
  return await timeLogModel.find({'uuid' : uuid});
}

let findPaging = async (uuid, dataPerPage, startData, period, search) => {

  // pagination after set period
  if(period !== undefined && search === undefined){
    return await timeLogModel.find({uuid : uuid}).where('start_time').lt(period).limit(dataPerPage).skip(startData);
  }
  // pagination after set search
  if(period === undefined && search !== undefined){
    return await timeLogModel.find({uuid : uuid, address : new RegExp('^'+search, 'i')}).limit(dataPerPage).skip(startData);
  }
  // pagination after set period and search
  if(period !== undefined && search !== undefined){
    return await timeLogModel.find({uuid : uuid, address : new RegExp('^'+search, 'i')}).where('start_time').lt(period).limit(dataPerPage).skip(startData);
  }
  // defalut pagination
  if((period === undefined || period === '') && (search === undefined || serarch !== '')){
    return await timeLogModel.find({uuid : uuid}).limit(dataPerPage).skip(startData);
  }
}

let findFilterPeriod = async (uuid, period) => {
  return await timeLogModel.find({uuid : uuid}).where('start_time').lt(period);
}

let findFilterAddress = async (uuid, search) => {
  return await timeLogModel.find({uuid : uuid, address : new RegExp('^'+search, 'i')});
}

let findFilterAddressAndPeriod = async (uuid, search, period ) => {
  return await timeLogModel.find({uuid : uuid, address : new RegExp('^'+search, 'i')}).where('start_time').lt(period);
}

module.exports = { timeLogModel, create, findAll, findPaging, findFilterPeriod, findFilterAddress, findFilterAddressAndPeriod};