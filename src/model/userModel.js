const db = require('../config/sqliteDB');

exports.reset = (sql) => {
  db.serialize(() => {
    db.each(sql);
    console.log('Drop User Table');
  })
}

exports.init = (sql) => {
  db.serialize(() => {
    db.each(sql)
    console.log('Init User Table')
  })
}

exports.findById = async (user_id) => {
  let promise = await new Promise((resolve) => {
    db.all(`SELECT user_id FROM user WHERE user_id = '${user_id}'`, [], (err, rows) => {
      if(err) console.log(err.message);
      else {
        resolve( rows )
      }
    })
  });

  return promise;
}

exports.findUser = async (user_id, pwd) => {
  let promise = await new Promise((resolve) => {
    db.all(`SELECT user_id, pwd FROM user WHERE user_id = '${user_id}'`, [], (err, rows) => {
      if(err) console.log(err.message);
      else {
        resolve( rows )
      }
    })
  });

  return promise;
}

exports.findMemberUUID = async (user_id) => {
  let promise = await new Promise((resolve) => {
    db.get(`SELECT uuid FROM user WHERE user_id = '${user_id}'`, [], (err, rows) => {
      if(err) console.log(err.message);
      else {
        resolve( rows )
      }
    })
  });

  return promise;
}

exports.save = (user) => {

  let sql = `INSERT INTO user (uuid, user_id, pwd) VALUES ('${user.uuid}', '${user.id}', '${user.pwd}')`

  db.run(sql, (err) => {
    if(err) console.error(err);
    console.log(`INSERT USER ${this.lastID}`);
  });

}
