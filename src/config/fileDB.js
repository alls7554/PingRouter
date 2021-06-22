'use strict'

const fs = require('fs');
const path = require('path');

const dbDir= '/data';

const dbPath = path.join(process.cwd(), dbDir);
const timeDBPath = path.join(dbPath, '/time');
const pingDBPath = path.join(dbPath, '/ping');
const tracerouterDBPath = path.join(dbPath, '/tracerouter');

if(fs.existsSync(dbPath) && process.env.NODE_ENV !== 'production') {
  console.log('Already Exist!!!');
}

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
  console.log(dbPath, '<- Create Data Dir');
}

if(!fs.existsSync(timeDBPath)) {
  fs.mkdirSync(timeDBPath);
  console.log(timeDBPath, '<- Create Time Dir');
}
  
if(!fs.existsSync(pingDBPath)) {
  fs.mkdirSync(pingDBPath);
  console.log(pingDBPath, '<- Create Ping Dir');
}

if(!fs.existsSync(tracerouterDBPath)) {
  fs.mkdirSync(tracerouterDBPath);
  console.log(tracerouterDBPath, '<- Create Tracerouter Dir');
}

module.exports = { fs, timeDBPath, pingDBPath, tracerouterDBPath };