'use strict'

const database = require('../services/database');
const encrypt = require('../lib/encryption');
const jwt = require('../lib/jwt')
const { v4 } = require('uuid');

exports.mainView = (req, res) => {
  
  let token = req.cookies['x-auth'];
  
  if(token) {
    let payload = jwt.checkJWT(token);
    if(payload){
      res.render('main', { title: 'PingRouter', nickname: payload.user_id});
    }
    else{
      res.status(403).json({ msg: 'forbidden' });
      next(err)
    }
  } else {
    res.render('register', { title: 'PingRouter' });
  }
}

exports.id_check = async (req, res) => {
  let user_id = req.params.id;

  let rows = await database.member.findById(user_id);

  if(process.env.NODE_ENV === 'development')
    console.log(rows)

  if(rows != null) {
    res.send({available:'NO'});
  } else {
    res.send({available:'YES'});
  }
}

exports.regist = async(req, res) => {

  let user = {};

  user.user_id = req.body.id,
  user.pwd = req.body.pwd,
  user.uuid = v4();

  let user_id = user.user_id;
  let rows = await database.member.findById(user_id);

  if(rows != null && user.pwd.length < 6) {
    res.send({available:'NO'});
  } else {
    user.pwd = await encrypt.pwdEncoder(user.pwd);
    database.member.create(user);
    res.send({success:'done'});
  }
}