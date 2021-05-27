const moment = require('moment');
const database = require('../services/database');
const dataPerPage = 10;

exports.mainView = async (req, res) => {

  let sql = makeSQL(findClientSessionId(req));
  sql += concatSQLSuffix(false);

  let rows = await database.sqlite3.find(sql);

  if(rows.length) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length % dataPerPage > 0) page_num++;
    res.render('history', { title:'PingRouter', data: rows, page:1, page_num:page_num, log_num:dataPerPage });
  } else {
    res.render('history', { title:'PingRouter', page:0, page_num:0, log_num:dataPerPage });
  }
}

exports.paging = async (req, res) => {
  let page = req.params.page;
  if (!page && typeof page !== 'string' && !isNaN(page)){
    res.status(404).send();
  }

  let sql = makeSQL(findClientSessionId(req)) + concatPagingSQL((page-1)*dataPerPage);

  if(req.query.address){
    sql += concatAddressSQL(req.query.address);
  }

  if(req.query.dateFilter == 'week'){
    sql += concatDateSQL('week')
  } else if(req.query.dateFilter == 'month'){
    sql += concatDateSQL('month')
  }

  sql += concatSQLSuffix(true);

  let rows = await database.sqlite3.find(sql);

  if(rows) {
    let totalData = await database.sqlite3.find('SELECT COUNT(idx) as totalData FROM time'); 

    let page_num = parseInt(totalData[0].totalData/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(totalData[0].totalData%dataPerPage > 0) page_num+=1;

    res.send({ rows: rows, totalData: totalData[0].totalData, page_num: page_num, log_num: dataPerPage });
  }
}

exports.dateFilter = async (req, res) => {

  let sql = makeSQL(findClientSessionId(req));

  if(req.params.period == 'week') {
    sql += concatDateSQL('week')
  } else if(req.params.period == 'month') {
    sql += concatDateSQL('month')
  } 

  sql += concatSQLSuffix(false);

  let rows = await database.sqlite3.find(sql);

  if(rows) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length%dataPerPage > 0) page_num+=1;

    res.send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
  }
}

exports.dateAndaddress = async (req, res) => {

  let address = req.params.address
  let sql = makeSQL(findClientSessionId(req));
  // let sql = `SELECT address, start_time, end_time FROM time WHERE session_id = '${reqSessionId}'`;

  if(address != 'all') {
    sql += concatAddressSQL(req.params.address);
  }

  if(req.params.period == 'week') {
    sql += concatDateSQL('week')
  } else if(req.params.period == 'month') {
    sql += concatDateSQL('month')
  }

  sql += concatSQLSuffix(false);

  let rows = await database.sqlite3.find(sql);

  if(rows) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length%dataPerPage > 0) page_num+=1;

    res.send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
  }
}

exports.addressSearch = async (req, res) => {

  let address = req.params.address 
  let sql = makeSQL(findClientSessionId(req));;

  if(address != 'all'){
    sql += concatAddressSQL(address); 
  }

  sql += concatSQLSuffix(false);

  let rows = await database.sqlite3.find(sql);
  if(rows) {
    let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
    if(rows.length%dataPerPage > 0) page_num+=1;

    res.send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
  }
}

exports.specificLog = async (req, res) => {
  let reqSessionId = findClientSessionId(req),
      temp = req.params.startTime.replace(/ /, 'T'),
      startTime = temp+'+09:00';

  database.tracerouterDBLog.findOneBystartTime(startTime)
  .then((trLog) => {
    if(!trLog) return res.status(404).send({err:`Not Exist Data`});
    else if(trLog[0].session_id != reqSessionId) return res.status(404).send({err:`Who Are you?`});
    database.pingDBLog.findOneBystartTime(startTime)
    .then((pingLog) => {
      if(!pingLog) return res.status(404).send({err:`Not Exist Data`});
      if(pingLog[0].session_id != reqSessionId) return res.status(404).send({err:`Who Are you?`});
      res.send({pingLog, trLog});
    }).catch(err => res.status(500).send(err));
  }).catch(err => res.status(500).send(err));
}

/*------------------------------------------------------------------------
*                                                                        *
*                                function                                *
*                                                                        *
------------------------------------------------------------------------*/

lastWeek = () => {
  let d = moment().day(-5).format();

  return d;
}

lastMonth = () => {
  let d = moment().subtract(1, 'M').format();

  return d;
}
findClientSessionId = (req) => {
  let temp;
  
  temp = req.headers.cookie.split('=');

  return temp[1];
}

makeSQL = (session_id) => {

  let sql = `SELECT idx, address, start_time, end_time FROM time WHERE session_id = '${session_id}'`;

  return sql;
}

concatPagingSQL = (page) => {
  if(page !== undefined && page !== null && page !== '')
    return ` AND idx > ${page}`
}

concatAddressSQL = (address) => {
  if(address !== undefined && address !== null && address !== '') {
    return ` AND address LIKE '%${address}%'`
  }
}

concatDateSQL = (date) => {
  if(date !== undefined && date !== null && date !== ''){
    if(date == 'week'){
      let lastweek = lastWeek();
      return ` AND start_time <= '${lastweek}'`
    } else if(date == 'month') {
      let lastmonth = lastMonth();
      return ` AND start_time <= '${lastmonth}'`
    }
  }
}

concatSQLSuffix = (limitable) => {
  if(limitable) {
    return ` ORDER BY start_time ASC LIMIT ${dataPerPage};`;
  } else {
    return ` ORDER BY start_time ASC;`;
  }
}