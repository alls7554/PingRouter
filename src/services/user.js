'use strict'

const database = require('../services/database');
const encrypt = require('../lib/encryption');
const jwt = require('../lib/jwt');

exports.login = async (loginData) => {

  let user_id = loginData.user_id

  let user = await database.member.findById(user_id);
  if(process.env.NODE_ENV === 'development')
    console.log(user);

  if(user != null) {
    let compareResult = await encrypt.pwdCompare(loginData.user_pwd, user.pwd);

    if(compareResult) {
      let token = jwt.createJWT(user.user_id);

      return token;
    }
  }

  return false;
}