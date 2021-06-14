'user strict'

const user = require('../services/login');
const jwt = require('../lib/jwt');
const ip = require('../lib/getIPAddress');
const path = require('path')

exports.mainView = (req, res) => {
  let token = req.cookies['x-auth'];
  let user_ip = ip.getIP(req);
  if(token) {
    let payload = jwt.checkJWT(token);
    if(payload){
      res.redirect('/main');
    } else{
      res.status(403).json({ msg: 'forbidden' });
      next(payload)
    }
  } else {
    res.status(200).render('index', {title: 'PingRouter', user_ip: user_ip})
  }
}

exports.login = async (req, res) => {

  let loginData = req.body;

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
  let user_ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
  if(req.cookies['x-auth']) {
    res.clearCookie('x-auth', {path:'/'});
  }
  res.render('index', {title: 'PingRouter', user_ip: user_ip});
}

exports.register = (req, res) => {
  res.sendFile(path.join(process.cwd(), "src/views/register.ejs"));
}