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
    res.render('register', { title: 'PingRouter - Sign up'});
  }
}

exports.id_check = async (req, res) => {
  let user_id = req.params.id;

  let rows = await database.user.findById(user_id);

  if(rows.length) {
    res.send({available:'NO'});
  } else {
    res.send({available:'YES'});
  }
}

exports.regist = async(req, res) => {

  let user = {id:req.body.id, pwd:req.body.pwd, uuid:v4()}
  let rows = await database.user.findById(user.id);

  if(!rows.length && user.pwd.length < 6) {
    res.send({available:'NO'});
  } else {
    user.pwd = await encrypt.pwdEncoder(user.pwd);
    database.user.save(user);
    res.send({success:'done'})
  }
}