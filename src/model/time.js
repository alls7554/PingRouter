
const db = require('../config/timeDB');

exports.reset = (drop, create) => {
  db.serialize(() => {
    db.each(drop)
    db.each(create)
    console.log('reset')
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

