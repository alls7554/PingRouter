const db = require('../config/fileDB');
const path = require('path');

let create = (payload) => {
  try {
    db.fs.writeFileSync(path.join(db.pingDBPath, payload.start_time), JSON.stringify(payload));
    if(process.env.NODE_ENV !== 'production')
      console.log('Save On Ping')
  } catch (error) {
    console.log(error);
  }
}

let findBystartTime = (startTime) => {

  try {
    let data = db.fs.readFileSync(path.join(db.pingDBPath, startTime), 'utf8')
    let result = [];
    
    result.push(JSON.parse(data));
  
    return result;
  } catch (err) {
    console.log(err);
  }

}

module.exports = { create, findBystartTime }