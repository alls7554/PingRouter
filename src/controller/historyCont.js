'use strict'


const jwt = require('../lib/jwt');
const database = require('../services/database');
const dateCalc = require('../lib/dateCalc');
const dataPerPage = 10;
let uuid;
let totalCount;


exports.mainView = async (req, res) => {
  let token = req.cookies['x-auth'];
  
  if(token){
    let payload = jwt.checkJWT(token);
    let user_id = payload.user_id

    if(payload){
      let user = await database.member.findById(user_id);
      uuid = user.uuid;
      if(uuid){
        let rows = await database.time.findAll(uuid);
        totalCount = rows.length;

        if(rows.length) {
          let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
          if(rows.length % dataPerPage > 0) page_num++;
          res.render('history', { 
            title: 'PingRouter', 
            data: rows, 
            page: 1, 
            page_num: page_num, 
            log_num: dataPerPage, 
            nickname: payload.user_id,
            totalCount: totalCount
          });
        } else {
          res.render('history', { 
            title: 'PingRouter', 
            page: 0, 
            page_num: 0, 
            log_num: dataPerPage, 
            nickname: payload.user_id,
            totalCount: 0
          });
        }
      } else {
        res.render('index', { title: 'PingRouter'});
      }
    } else {
      res.status(403).send();
    }
  } else {
      res.status(403).render('index', { title: 'PingRouter'});
    }
}

exports.paging = async (req, res) => {

  if(uuid) {
    let page = req.params.page;
    let period;
    let address;
    let rows;

    if (!page && typeof page !== 'string' && !isNaN(page)){
      res.status(404).send();
    }

    if(req.query.address !== undefined) {
      address = req.query.address;
    }
    if (req.query.dateFilter !== undefined ){
      period = req.query.dateFilter;
    }

    rows = await database.time.findPaging(uuid, dataPerPage, (page-1)*dataPerPage, address, period);


    if(rows) {

      let page_num = parseInt(totalCount/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
      if(totalCount%dataPerPage > 0) page_num+=1;
      
      res.send({ rows: rows, totalData: totalCount, page_num: page_num, log_num: dataPerPage });
    }
  } else {
    res.status(403).send();
  }
}

exports.dateFilter = async (req, res) => {

  if(uuid) {
    let rows;

    if(req.params.period == 'week') {
      let week = dateCalc.lastWeek();
      rows = await database.time.findFilterPeriod(uuid, dataPerPage, week);
    } else if (req.params.period == 'month') {
      let month = dateCalc.lastMonth();

      rows = await database.time.findFilterPeriod(uuid, dataPerPage, month);
    } else {
      rows = await database.time.findAll(uuid);
    }
  
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
  
  if(uuid){
    let address = req.params.address,
        period = req.params.period;
  
    let rows = await database.time.findAll(sql);
  
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

  if(uuid) {
    let address = req.params.address 
    let rows;
    if(address != 'all'){
      rows = await database.time.findFilterAddress(uuid, address);
    } else {
      rows = await database.time.findAll(uuid);
    }

    
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

  if(uuid) {
    let temp = req.params.startTime.replace(/ /, 'T'),
    startTime = temp+'+09:00';

    let tracerouterLog = await database.tracerouter.findBystartTime(startTime);

    let pingLog = await database.ping.findBystartTime(startTime);

    res.send({pingLog, tracerouterLog});
  } else {
    res.status(403).render('index', {title:'PingRouter'})
  }
}