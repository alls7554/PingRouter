const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(process.env.SQLITE_URI, sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.log(err); 
  } else {
    console.log('open sqlite3 db');
  }
});

module.exports = db;