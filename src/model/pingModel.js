const db = require('../config/fileDB');
const path = require('path');

let create = (payload) => {
  try {
    let title = payload.start_time.replace(/:/g, '-');
    db.fs.writeFileSync(path.join(db.pingDBPath, title), JSON.stringify(payload));
    if(process.env.NODE_ENV !== 'production')
      console.log('Save On Ping')
  } catch (error) {
    console.log(error);
  }
}

let findBystartTime = (startTime) => {

  try {
    let title = startTime.replace(/:/g, '-');
    let data = db.fs.readFileSync(path.join(db.pingDBPath, title), 'utf8');
    let result = [];
    
    result.push(JSON.parse(data));
  
    return result;
  } catch (err) {
    console.log(err);
  }

}

module.exports = { create, findBystartTime }