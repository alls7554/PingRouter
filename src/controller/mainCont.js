'use strict'

const jwt = require('../lib/jwt');

exports.mainView = (req, res) => {

  let token = req.cookies['x-auth'];
  
  if(token) {
    let payload = jwt.checkJWT(token);
    if(payload){
      res.render('main', { title: 'PingRouter', nickname: payload.user_id});
    }
    else{
      res.status(405).json({ msg: 'error' });
      next(err)
    }
  } else {
    res.render('index', { title: 'PingRouter'});
  }
}