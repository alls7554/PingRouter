'use strict'

const dateCalc = require('../lib/dateCalc');
const ip = require('../lib/getIPAddress');
const database = require('../services/database');
const isNotEmpty = require('../lib/isNotEmpty');
const dataPerPage = 10;

exports.mainView = (req, res) => {
  
  let rows = database.time.findAll();
  let user_ip = ip.getIP(req);

  if(rows) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length % dataPerPage > 0) page_num++;
    res.status(200).render('history', { 
      title: 'PingRouter', 
      data: rows, 
      page: 1, 
      page_num: page_num, 
      log_num: dataPerPage, 
      user_ip: user_ip
    });
  } else {
    res.status(200).render('history', { 
      title: 'PingRouter', 
      page: 0,
      page_num: 0,
      log_num: dataPerPage,
      user_ip: user_ip
    });
  }
}


exports.paging = (req, res) => {

  let page = req.params.page;
  let period;
  let address;
  let rows;

  if (!page && typeof page !== 'string' && !isNaN(page)){
    res.status(404).send();
  }

  if(isNotEmpty.isNotEmpty(req.query.address)) {
    address = req.query.address;
  }
  if (isNotEmpty.isNotEmpty(req.query.dateFilter)){
    if(req.query.dateFilter === 'week')
      period = dateCalc.lastWeek();

    else if(req.query.dateFilter === 'month')
      period = dateCalc.lastMonth();
  }

  rows = database.time.findPaging(dataPerPage, (page-1)*dataPerPage, page, address, period);

  if(rows) {
    let page_num = parseInt(rows.fileList.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.fileList.length%dataPerPage > 0) page_num+=1;

    res.status(200).send({ rows: rows.result, totalData: rows.fileList.length, page_num: page_num, log_num: dataPerPage, page: page });
  }
}

exports.dateFilter = (req, res) => {
  
  let rows;

  if(req.params.period == 'week') {
    let week = dateCalc.lastWeek();
    rows = database.time.findFilterPeriod(week);
  } else if (req.params.period == 'month') {
    let month = dateCalc.lastMonth();
    rows = database.time.findFilterPeriod(month);
  } else {
    rows = database.time.findAll();
  }

  if(rows) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length%dataPerPage > 0) page_num+=1;

    res.status(200).send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
  }
}

exports.dateAndaddress = (req, res) => {
  let address = req.params.address,
      period;

  if(req.params.period == 'week') {
    period = dateCalc.lastWeek();
  } else if (req.params.period == 'month') {
    period = dateCalc.lastMonth();
  }

  let rows = database.time.findFilterAddressAndPeriod(address, period);

  if(rows) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length%dataPerPage > 0) page_num+=1;

    res.status(200).send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
  }
}

exports.addressSearch = (req, res) => {

  let address = req.params.address 
  let rows;
  if(address != 'all'){
    rows = database.time.findFilterAddress(address);
  } else {
    rows = database.time.findAll();
  }

  if(rows) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length%dataPerPage > 0) page_num+=1;

    res.status(200).send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
  }
} 


exports.specificLog = (req, res) => {

  let temp = req.params.startTime.replace(/ /, 'T'),
  startTime = temp+'+09:00';
  
  let pingLog = database.ping.findBystartTime(startTime);

  let tracerouterLog = database.tracerouter.findBystartTime(startTime);

  res.status(200).send({pingLog, tracerouterLog});

}