
const pingDBLog = require('../model/ping');
const tracerouterDBLog = require('../model/tracerouter')

const sqlite3 = require('../model/time');
const createTimeQuery = `
  CREATE TABLE time(
    idx integer, 
    session_id text,
    address text,
    start_time text,
    end_time text
  )
  `;
const dropQuery = `
  drop TABLE time
`;

// sqlite3.reset(dropQuery, createTimeQuery)

module.exports = { pingDBLog, tracerouterDBLog, sqlite3 }