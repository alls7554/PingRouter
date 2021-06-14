const ip = require('ip');

const ipReg = new RegExp('localhost' | '127.0.0.1');

exports.getIP = (req) => {

  if(ipReg.exec(req.headers.host)){
    return ip.address();
  } else {
    let tmp = req.headers['x-forwarded-for'] ||
              req.connection.remoteAddress ||
              req.socket.remoteAddress ||
              req.connection.socket.remoteAddress;
    let test = tmp.split('::ffff:');
    return test[1];
  }


}