
const pingDBLog = require('../model/pingModel');
const tracerouterDBLog = require('../model/tracerouterModel')

const time = require('../model/timeModel');
const user = require('../model/userModel');

// idx는 pk면서 autoIncrease
// uuid는 unique Key
const createTimeQuery = `
  CREATE TABLE time(
    idx integer primary key autoincrement,
    uuid text unique,
    address text,
    start_time text,
    end_time text
  )
  `;
const createUserQuery = `
  CREATE TABLE user(
    idx integer primary key autoincrement,
    uuid text unique,
    user_id text,
    pwd text
  )
`;

const dropTime = `
  drop TABLE time
`;

const dropUser = `
  drop TABLE user
`;

// time.reset(dropTime);
// time.init(createTimeQuery);
// user.reset(dropUser);
// user.init(createUserQuery);

module.exports = { pingDBLog, tracerouterDBLog, time, user }