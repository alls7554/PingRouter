'use strict'

const jwt = require('../lib/jwt');
const ip = require('../lib/getIPAddress');

exports.mainView = (req, res, next) => {

  let token = req.cookies['x-auth'];
  let user_ip = ip.getIP(req);
  
  if(token) {
    let payload = jwt.checkJWT(token);
    if(payload){
      res.render('main', { title: 'PingRouter', nickname: payload.user_id, user_ip: user_ip});
    }
    else{
      res.status(405).json({ msg: 'error' });
      next(err)
    }
  } else {
    res.render('index', { title: 'PingRouter', user_ip: user_ip});
  }
}