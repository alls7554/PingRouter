'use strict'

const jwt = require('jsonwebtoken');

const MY_SECRET_KEY = SECRET_KEY;

exports.createJWT = (user_id) => {
  return jwt.sign(
    {
      user_id: user_id
    }, MY_SECRET_KEY
    );
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