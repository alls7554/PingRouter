'use strict'

const ip = require('../lib/getIPAddress');

exports.mainView = (req, res) => {
  let user_ip = ip.getIP(req);

  res.render('main', { title: 'PingRouter', user_ip: user_ip});

}