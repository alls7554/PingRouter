
const db = require('../config/sqliteDB');

exports.reset = (sql) => {
  db.serialize(() => {
    db.each(sql);
    console.log('Drop Time Table');
  })
}

exports.init = (sql) => {
  db.serialize(() => {
    db.each(sql)
    console.log('Init Time Table')
  })
}

exports.save = (sql) => {
  db.run(sql);
}

exports.find = async (sql) => {
  let promise = await new Promise((resolve) => {
    db.all(sql, [], (err, rows) => {
      if(err) console.log(err.message);
      else {
        resolve( rows )
      }
    })
  });

  return promise;
}

exports.findOne = async(sql) => {
  let promise = await new Promise((resolve) => {
    db.get(sql, [], (err, rows) => {
      if(err) console.log(err.message);
      else {
        resolve( rows )
      }
    })
  });

  return promise;
}