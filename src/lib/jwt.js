'use strict'

const jwt = require('jsonwebtoken');

const MY_SECRET_KEY = process.env.SECRET_KEY;

exports.createJWT = (user_id, uuid) => {
  return jwt.sign(
    {
      user_id: user_id,
      uuid: uuid 
    }, MY_SECRET_KEY
    );
}

exports.getJWT = (req) => {
  return req.cookies['x-auth'];
}

exports.checkJWT = (token) => {
  let payload;
  try {
    payload = jwt.verify(token, MY_SECRET_KEY);
  } catch(err) {
    return err;
  }
  return payload;
}