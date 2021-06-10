'use strict'

const moment = require('moment');

exports.lastWeek = () => {
  return moment().day(-5).format();
}

exports.lastMonth = () => {
  return moment().subtract(1, 'M').format();
}