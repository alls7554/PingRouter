

const db = require('../config/fileDB');
const path = require('path');
const isNotEmpty = require('../lib/isNotEmpty');

let create = (payload) => {
  try{
    let title = payload.start_time.replace(/:/g, '-');
    db.fs.writeFileSync(path.join(db.timeDBPath, title), JSON.stringify(payload));
    if(process.env.NODE_ENV !== 'production')
      console.log('Save On Time');
  } catch (error) {
    console.log(error);
  }
}

// Read
let findAll = () => {
  try{
    let result = [];

    let fileList = db.fs.readdirSync(db.timeDBPath, 'utf8');
    fileList.forEach(file => {
      try {
        let fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file), 'utf8'));
    
        result.push(fileData);
      } catch (error) {
        console.log(error);
      }
    });

    return result;

  } catch (error) {
    console.log(error);
  }
}

let findPaging = (dataPerPage, startData, page, search, period) => {
  try{
    let tmpResult = [];
    let result = [];
    let fileList = db.fs.readdirSync(db.timeDBPath, 'utf8');
    let addressExp = new RegExp('^'+search, 'i');
    let fileData;

    fileList.forEach(file => {
      // 기간 필터 + 주소 필터
      if(isNotEmpty.isNotEmpty(period) && isNotEmpty.isNotEmpty(search)){
        if(period > file){
          fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file)));
          if(addressExp.test(fileData.address)){
            tmpResult.push(fileData)
          }
        }
      } else {
        // 주소필터
        if(period == undefined && isNotEmpty.isNotEmpty(search)) {
          fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file)));
          if(addressExp.test(fileData.address)){
            tmpResult.push(fileData)
          }
        }
        // 기간필터 
        else if (period !== 'all' && isNotEmpty.isNotEmpty(period) && search == undefined ){
          if(period > file) {
            console.log(period);
            fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file)));
            tmpResult.push(fileData);
          }
        } 
        // 필터 X
        else {
          fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file)));
          tmpResult.push(fileData);
        }
      }
    });

    for(let i = startData; i<page*dataPerPage; i++){
      if(tmpResult[i] === undefined) break;

      try {
        fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, tmpResult[i].start_time)))
        result.push(fileData);        
      } catch (error) {
        console.log(error);
      }
    }

    return { fileList, result };
  } catch (error) {
    console.log(error);
  }
}

let findFilterPeriod = (period) => {
  try {
    let result = [];

    let fileList = db.fs.readdirSync(db.timeDBPath, 'utf8');

    fileList.forEach(file =>{
      if(period > file){
        let fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file), 'utf8'));
        result.push(fileData);
      }
    });

    return result;
  } catch (error) {
    console.log(error);
  }
}

let findFilterAddress = (search) => {
  try {
    let result = [];

    let addressExp = new RegExp('^'+search, 'i');

    let fileList = db.fs.readdirSync(db.timeDBPath, 'utf8');

    fileList.forEach(file => {
      try {
        let fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file), 'utf8'));
        if(addressExp.test(fileData.address)){
          result.push(fileData)
        }
      } catch (error) {
        console.log(error);
      }
    });

    return result;
  } catch (error) {
    console.log(error);
  }
}

let findFilterAddressAndPeriod = (search, period ) => {
  try {
    let result = []

    let addressExp = new RegExp('^'+search, 'i');

    let fileList = db.fs.readdirSync(db.timeDBPath, 'utf8');

    fileList.forEach(file => {
      try {
        if(period > file){
          let fileData = JSON.parse(db.fs.readFileSync(path.join(db.timeDBPath, file), 'utf8'));
          if(addressExp.test(fileData.address)){
            result.push(fileData);
          }
        }
      } catch (error) {
        console.log(error);
      }
    })

    return result;
  } catch (error) {
    console.log(error);
  }
}




module.exports = { create, findAll, findPaging, findFilterPeriod, findFilterAddress, findFilterAddressAndPeriod};