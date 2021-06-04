const moment = require('moment');
const jwt = require('../lib/jwt');
const database = require('../services/database');
const dataPerPage = 10;

exports.mainView = async (req, res) => {

  let sql = makeSQL(await findMemberUUID(req));

  if(sql){
    sql += concatSQLSuffix(false);
    let rows = await database.time.find(sql);
  
    if(rows.length) {
      let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
      if(rows.length % dataPerPage > 0) page_num++;
      res.render('history', { title:'PingRouter', data: rows, page:1, page_num:page_num, log_num:dataPerPage });
    } else {
      res.render('history', { title:'PingRouter', page:0, page_num:0, log_num:dataPerPage });
    }
  } else {
    res.render('index', { title: 'PingRouter'});
  }
}

exports.paging = async (req, res) => {

  let sql = makeSQL(await findMemberUUID(req));

  if(sql) {
    let page = req.params.page;

    if (!page && typeof page !== 'string' && !isNaN(page)){
      res.status(404).send();
    }

    sql += concatPagingSQL((page-1)*dataPerPage);

    if(req.query.address){
      sql += concatAddressSQL(req.query.address);
    }
  
    if(req.query.dateFilter == 'week'){
      sql += concatDateSQL('week')
    } else if(req.query.dateFilter == 'month'){
      sql += concatDateSQL('month')
    }
  
    sql += concatSQLSuffix(true);
  
    let rows = await database.time.find(sql);
  
    if(rows) {
      let totalData = await database.time.find('SELECT COUNT(idx) as totalData FROM time'); 
  
      let page_num = parseInt(totalData[0].totalData/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
      if(totalData[0].totalData%dataPerPage > 0) page_num+=1;
  
      res.send({ rows: rows, totalData: totalData[0].totalData, page_num: page_num, log_num: dataPerPage });
    }
  } else {
    res.status(403).send();
  }
}

exports.dateFilter = async (req, res) => {

  let sql = makeSQL(await findMemberUUID(req));

  if(sql) {
    if(req.params.period == 'week') {
      sql += concatDateSQL('week')
    } else if(req.params.period == 'month') {
      sql += concatDateSQL('month')
    } 
  
    sql += concatSQLSuffix(false);
  
    let rows = await database.time.find(sql);
  
    if(rows) {
      let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
      if(rows.length%dataPerPage > 0) page_num+=1;
  
      res.send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
    }
  } else {
    res.status(403).send();
  }

}

exports.dateAndaddress = async (req, res) => {

  let sql = makeSQL(await findMemberUUID(req));
  
  if(sql){
    let address = req.params.address
    if(address != 'all') {
      sql += concatAddressSQL(req.params.address);
    }
  
    if(req.params.period == 'week') {
      sql += concatDateSQL('week')
    } else if(req.params.period == 'month') {
      sql += concatDateSQL('month')
    }
  
    sql += concatSQLSuffix(false);
  
    let rows = await database.time.find(sql);
  
    if(rows) {
      let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
      if(rows.length%dataPerPage > 0) page_num+=1;
  
      res.send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
    }
  } else {
    res.status(403).send();
  }
}

exports.addressSearch = async (req, res) => {

  let sql = makeSQL(await findMemberUUID(req)); 
  
  if(sql) {
    let address = req.params.address 
    if(address != 'all'){
      sql += concatAddressSQL(address); 
    }
  
    sql += concatSQLSuffix(false);
  
    let rows = await database.time.find(sql);
    if(rows) {
      let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
      if(rows.length%dataPerPage > 0) page_num+=1;
  
      res.send({ rows:rows, page:1, page_num: page_num, log_num: dataPerPage });
    }
  } else {
    res.status(403).send();
  }
}

exports.specificLog = async (req, res) => {
  let uuid = await findMemberUUID(req);

  if(uuid) {
    let temp = req.params.startTime.replace(/ /, 'T'),
    startTime = temp+'+09:00';

    database.tracerouterDBLog.findOneBystartTime(startTime)
    .then((trLog) => {
      if(!trLog) return res.status(404).send({err:`Not Exist Data`});
      else if(trLog[0].uuid != uuid) return res.status(404).send({err:`Who Are you?`});
      database.pingDBLog.findOneBystartTime(startTime)
      .then((pingLog) => {
        if(!pingLog) return res.status(404).send({err:`Not Exist Data`});
        if(pingLog[0].uuid != uuid) return res.status(404).send({err:`Who Are you?`});
        res.send({pingLog, trLog});
      }).catch(err => res.status(500).send(err));
    }).catch(err => res.status(500).send(err));
  } else {
    res.status(403).send();
  }

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

findMemberUUID = async (req) => {
  let token = req.cookies['x-auth'];

  if(token){
    let payload = jwt.checkJWT(token);
    if(payload){
      let member_uuid = await database.user.findMemberUUID(payload.user_id);
      return member_uuid.uuid;
    } else {
      return false;
    }
  }
}

makeSQL = (uuid) => {
  if(uuid){
    let sql = `SELECT idx, address, start_time, end_time FROM time WHERE uuid = '${uuid}'`;
  
    return sql;
  } else {
    return false;
  }
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