
const bcrypt = require('bcrypt')
const saltRounds = 10;


exports.pwdEncoder = async (pwd) => {
  
  let promise = await new Promise((resolve) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if(err) return next(err);
      bcrypt.hash(pwd, salt, (err, hash) => {
        if(err) return next(err);
        resolve( hash );
      });
    });
  });

  return promise;
}

exports.pwdCompare = async (inputPwd, dbPwd) => {
  let promise = await new Promise((resolve) => {
    bcrypt.compare(inputPwd, dbPwd, (err, res) => {
      if(err) return next(err);
      
      resolve( res );
    });
  });

  return promise;
}

