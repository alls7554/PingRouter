const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');
const PingDBLog = require('../public/javascripts/ping');
const TracerouterDBLog = require('../public/javascripts/tracerouter');
const dataPerPage = 10;

const db = new sqlite3.Database('./database/log.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    console.log(err);
  } else {
    console.log('open server db');
  }
});

// Enter history Page
router.get('/', (req, res, next) => {
  let reqSessionId = findClientSessionId(req);
  let sql = `SELECT address, start_time, end_time FROM time WHERE session_id = '${reqSessionId}';`
  
  db.all(sql, [], (err, rows) => {
    if(rows.length){
      if(err){
        throw err;
      }

      let page_num = parseInt(rows.length/dataPerPage); // Page 수, (전체 데이터 수 / 페이지당 데이터 수)
      if(rows.length%dataPerPage > 0) page_num++;

      res.render('history', { title:'PingRouter', data: rows, page:1, page_num:page_num, log_num:dataPerPage });
    } else {
      res.render('history', {title:'PingRouter', page:0, page_num:0})
    }
  }); 
});


// pagination
router.get('/pages/:page', (req, res, next) => {
  let reqSessionId = findClientSessionId(req);
  let sql = `SELECT address, start_time, end_time FROM time WHERE session_id = '${reqSessionId}'`
  let page = req.params.page;

  if(req.query.dateFilter == 'week'){
    let lastweek = lastWeek();
    sql += ` AND start_time <= '${lastweek}';`
  } else if(req.query.dateFilter == 'month'){
    let lastmonth = lastMonth();
    sql += ` AND start_time <= '${lastmonth}';`
  } else{
    sql += `;`;
  }

  db.all(sql, [], (err, rows) => {
    if(err){
      throw err;
    }

    let page_num = parseInt(rows.length/dataPerPage);
    if(rows.length%dataPerPage > 0) page_num++;

    res.send({ rows: rows, page:parseInt(page), page_num:page_num, log_num:dataPerPage });

  }); 
});


// date Filter
router.get('/date/:period', (req, res, next) => {

  let reqSessionId = findClientSessionId(req);
  let sql = `SELECT address, start_time, end_time FROM time WHERE session_id = '${reqSessionId}'`;

  if(req.params.period == 'week') {
    let lastweek = lastWeek();
    sql += ` AND start_time <= '${lastweek}';`;
  } else if(req.params.period == 'month') {
    let lastmonth = lastMonth();
    sql += ` AND start_time <= '${lastmonth}';`;
  } else {
    sql += `;`;
  }

  db.all(sql, [], (err, rows) => {
    if(err){
      throw err;
    }
    res.send({rows:rows, log_num:dataPerPage, page:1});
  });
});


// date Filter + address search
router.get('/:period/search/:address', (req, res, next) => {
  let reqSessionId = findClientSessionId(req);
  let sql = 'SELECT address, start_time, end_time FROM time WHERE';

  if(req.params.period == 'all') {
    sql += ` session_id = '${reqSessionId}'`
  }

  if(req.params.period == 'week') {
    let lastweek = lastWeek();

    sql += ` start_time <= '${lastweek}' AND session_id = '${reqSessionId}'`
  }
  if(req.params.period == 'month') {
    let lastmonth = lastMonth();
    sql += ` start_time <= '${lastmonth}' AND session_id = '${reqSessionId}'`
  }

  sql += ` AND address LIKE '%${req.params.address}%';`

  db.all(sql, [], (err, rows) => {
    if(err){
      throw err;
    }
    res.send({rows:rows, log_num:dataPerPage, page:1});
  });
});

// address search
router.get('/search/:address', (req,res,next) => {
  let reqSessionId = findClientSessionId(req);
  let address = req.params.address 
  let sql = `SELECT address, start_time, end_time FROM time WHERE session_id = '${reqSessionId}'`

  if(address == 'all'){
    sql+= ';';
  } else {
    sql +=  `AND address LIKE '%${req.params.address}%'`;
  }


  db.all(sql, [], (err, rows) => {
    if(err){
      throw err;
    }
    res.send({rows:rows, log_num:dataPerPage, page:1});
  })
});

// specific log
router.get('/select/:startTime', (req, res, next) => {
  let reqSessionId = findClientSessionId(req),
      temp = req.params.startTime.replace(/ /, 'T'),
      startTime = temp+'+09:00';

  TracerouterDBLog.findOneBystartTime(startTime)
  .then((trLog) => {
    if(!trLog) return res.status(404).send({err:`Not Exist Data`});
    else if(trLog[0].session_id != reqSessionId) return res.status(404).send({err:`Who Are you?`});
    PingDBLog.findOneBystartTime(startTime)
    .then((pingLog) => {
      if(!pingLog) return res.status(404).send({err:`Not Exist Data`});
      if(pingLog[0].session_id != reqSessionId) return res.status(404).send({err:`Who Are you?`});
      res.send({pingLog, trLog});
    }).catch(err => res.status(500).send(err));
  }).catch(err => res.status(500).send(err));
});


/*------------------------------------------------------------------------
*
*                               function
*
------------------------------------------------------------------------*/
findClientSessionId = (req) => {
  let temp;
  req.rawHeaders.forEach((idx) => {
    if(idx.indexOf('connect.sid') != -1){
      temp = idx.split('=')
    }
  });
  return temp[1];
}

lastWeek = () => {
  let d = moment().day(-5).format();

  return d;
}

lastMonth = () => {
  let d = moment().subtract(1, 'M').format();

  return d;
}

module.exports = router;