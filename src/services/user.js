'use strict'

const database = require('../services/database');
const encrypt = require('../lib/encryption');
const jwt = require('../lib/jwt');

exports.login = async (loginData) => {
  let user = await database.user.findUser(loginData.user_id);
  console.log(user)
  if(user.length) {
    let compareResult = await encrypt.pwdCompare(loginData.user_pwd, user[0].pwd);

    if(compareResult) {
      let token = jwt.createJWT(user[0].user_id);

      return token;
    }
    else {
      return false;
    }
  } else {
    return false;
  }
}