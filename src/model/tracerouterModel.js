const db = require('../config/fileDB');
const path = require('path');

let create = (payload) => {
  try {
    let title = payload.idx +'_'+ payload.start_time;
    db.fs.writeFileSync(path.join(db.tracerouterDBPath, title), JSON.stringify(payload));
    if(process.env.NODE_ENV !== 'production')
      console.log('Save On TraceRouter');
  } catch (error) {
  }
}

let findBystartTime = (startTime) => {
  try {
    let result = [];

    let fileList = db.fs.readdirSync(db.tracerouterDBPath, 'utf8');
    
    fileList.forEach(file => {
      let title = file.split('_');
      try {
        if(title[1] === startTime) {
          let data = db.fs.readFileSync(path.join(db.tracerouterDBPath, file), 'utf8')
          result.push(JSON.parse(data));
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

module.exports = { create, findBystartTime }
