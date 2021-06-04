'user strict'

const user = require('../services/user');
const jwt = require('../lib/jwt');

exports.mainView = (req, res) => {
  let token = req.cookies['x-auth'];
  
  if(token) {
    let payload = jwt.checkJWT(token);
    if(payload){
      res.render('main', { title: 'PingRouter', nickname: payload.user_id});
    } else{
      res.status(403).json({ msg: 'forbidden' });
      next(payload)
    }
  } else {
    res.render('index', { title: 'PingRouter'});
  }
}

exports.login = async (req, res) => {

  let loginData = req.body

  let token = await user.login(loginData);

  if(token) {
    res.cookie('x-auth', token);
    res.status(201).json({
      result: 'ok',
      token
    });
  } else {
    res.status(403).send();
  }
}

exports.logout = (req, res) => {
  if(req.cookies['x-auth']) {
    res.clearCookie('x-auth', {path:'/'});
  }
  res.render('index', { title: 'PingRouter'});
}