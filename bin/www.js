'use strict';

const app = require('../app');
const server = require('http').createServer(app);
const io = require('../src/services/socket.io')(server);
const PORT = process.env.PORT || 5500;

server.listen(PORT, () => {
  console.log(`Express server has started on port ${PORT}`);
});

module.exports = server