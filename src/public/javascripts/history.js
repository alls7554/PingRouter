const doc = document;

let ctx = doc.getElementById('myChart');
let myChart =new Chart(ctx, options);

let timelines = doc.getElementsByClassName('log');
let periods = doc.getElementsByClassName('period');
let pagination = doc.getElementsByClassName('page-item');
let address;
let dateFilter;

// Pagination
$(document).on('click', '.page-item', (obj) => {
  page = obj.currentTarget.id;
  
  if(page == 'next') page = obj.currentTarget.value;
  if(page == 'prev') page = obj.currentTarget.value;

  $.ajax({
    type: 'GET',
    url: `/history/pages/${page}`,
    data: {dateFilter, address},
    dataType: 'json',
    success: (data) => {
      loadData(data);
      paging(data.totalData, data.log_num, 5 ,page);
    }
  })
});

// Date Filter
$(periods).click((obj)=>{
  address = $('#search').val();
  let url = '';
  dateFilter = obj.currentTarget.id;

  if(address == '') url = `/history/date/${dateFilter}`
  else url = `/history/date/${dateFilter}/search/${address}`

  $.ajax({
    type: 'GET',
    url: url,
    data: {},
    dataType: 'json',
    success: (data) => {
      loadData(data);
      paging(data.rows.length, data.log_num, 5, data.page);
    }
  });
});

// IP address search
$('#search').on('propertychange change paste input', () => {
  address = $('#search').val();
  let url = address;
  let spaceExp = new RegExp(/\s/g);

  if(address == '' || spaceExp.exec(address) != null) {
    url = '/history/search/all';
  } else{
    url = `/history/search/${address}`;
  }
  $.ajax({
    type: 'GET',
    url: url,
    data: {},
    dataType: 'json',
    success: (data) => {
      loadData(data);
      paging(data.rows.length, data.log_num, 5, data.page);
    }
  });
});

// specific log
$(document).on("click", ".log", (timeline) => {

  // 이미 클릭되어 있는 로그를 누를 때 반응 죽이기
  if($(timeline.currentTarget).hasClass('table-danger')){
    return;
  } 

  let startTime = timeline.currentTarget.childNodes[5].childNodes[0].innerText;

  $(timeline.currentTarget).siblings('.log').removeClass('table-danger');
  $(timeline.currentTarget).addClass('table-danger');
  loading();
  $.ajax({
    type: "GET",
    url: '/history/select/'+startTime,
    data: {},
    dataType: 'json',
    success: (data) => { 
      $('.pingLog').remove();
      $('.pingResultLog').remove();
      $('.trLog').remove();
      $('.trResultlog').remove();
      $('#save').attr('disabled', false);
      myChart.update('reset');
      resetData(myChart);

      startTime = replaceTimeString(data.pingLog[0].start_time);

      $('#address').text(`Address : ${data.pingLog[0].address}`);
      $('#startTime').text(`StartTime : ${startTime}`);

      for(let i = 0; i<data.tracerouterLog.length; i++){
        for(let j = 0; j<data.tracerouterLog[i].log.length-1; j++){
          $('#trLog_list').append(`<li class='list-group-item trLog'><span>${data.tracerouterLog[i].log[j].hop} ${data.tracerouterLog[i].log[j].ip} ${data.tracerouterLog[i].log[j].rtt1}</span></li>`);
        }
        code = data.tracerouterLog[i].log[data.tracerouterLog[i].log.length-1];
        $('#trLog_list').append(`<li class='list-group-item list-group-item-success trLog'><span>Close: ${code}</span></li>`);
      }
      

      for(let i = 0; i < data.pingLog[0].log.length; i++){
        $('#ping_textLog_list').append(`<li class='list-group-item pingLog'><span>${data.pingLog[0].address}: icmp_seq=${data.pingLog[0].log[i].icmp_seq} time=${data.pingLog[0].log[i].time}ms</span></li>`);
      }

      $('#ping_textLog_list').append(`<li class='list-group-item list-group-item-success pingResultLog'><span>--- ping statistics ---</span></li>`);
      $('#ping_textLog_list').append(`<li class='list-group-item pingResultLog'><span>${data.pingLog[0].summaryLog.cnt} packets transmitted, ${data.pingLog[0].summaryLog.cnt} packets received</span></li>`);
      $("#ping_textLog_list").append(`<li class='list-group-item pingResultLog'><span>round-trip min/avg/max = ${data.pingLog[0].summaryLog.min}/${data.pingLog[0].summaryLog.avg}/${data.pingLog[0].summaryLog.max} (ms)</span></li>`);
      let pinglogs = doc.getElementsByClassName('pingLog');

      let idx = 0, sum = 0;
      for(let pinglog of pinglogs) {
        data = pinglog.innerText;
        splitData = data.split(/time=/g);
        temp = splitData[1].replace(/ms/g, '');

        sum = sum + parseInt(temp);
        addData(myChart, idx++, temp, (sum/idx).toFixed(3));
      }
      clearLoading();
    }, //End Success function
    error: (err) => { console.log('err!!'); console.error(err) }
  });
});

$('#save').on('click', ()=> {
  let tmpTime = doc.getElementById('startTime').innerText;
  let startTime = tmpTime.split(': ');

  let pingLogs = doc.getElementsByClassName('pingLog');
  let pingResultLogs = doc.getElementsByClassName('pingResultLog');
  let trLogs = doc.getElementsByClassName('trLog');
  let pingResult = {
    title : [],
    packet: [],
    rtt : []
  };

  let imageURL = ctx.toDataURL(1.0);

  pingResult.title.push(pingResultLogs[0].innerText)
  pingResult.packet.push(pingResultLogs[1].innerText)
  pingResult.rtt.push(pingResultLogs[2].innerText)
  
  data = downloadReady(pingLogs, pingResult, trLogs);
  download(startTime[1], data, imageURL);
});

replaceTimeString = (timeString) => {
  return timeString.replace(/\+09:00|T/g, ' ');
}

loadData = (data) => {
  $('.log').remove();
  if(data.rows.length){
    for(let i=0; i<data.log_num; i++){
      if(i == (data.rows.length)) break;


      let startTime = replaceTimeString(data.rows[i].start_time);
      let endTime = replaceTimeString(data.rows[i].end_time);

      $('#contents').append(`<tr class='log'> 
                              <td>${(data.page-1)*data.log_num+(i+1)}</td> 
                              <td>${data.rows[i].address}</td> 
                              <td><span class='startTime'>${startTime}</span><br><span>${endTime}</span></td> 
                            </tr>`);
    }
  }
}

paging = (totalData, dataPerPage, pageCount, currentPage) => {
  $('.page-item').remove();

  let totalPage = Math.ceil(totalData/dataPerPage);
  let pageGroup = Math.ceil(currentPage/pageCount);

  if(pageCount > 5) pageCount = 5;

  let last = pageGroup * pageCount;

  if(last > totalPage)
    last = totalPage;

  let first = ((pageGroup-1) * pageCount)+1;
  let next = last+1;
  let prev = first-1;

  // console.log('totalData : ' + totalData);
  // console.log('dataPerPage : ' + dataPerPage)
  // console.log('pageCount : ' + pageCount)
  // console.log('currentPage : ' + currentPage)
  // console.log('totalPage : ' + totalPage);
  // console.log('pageGroup : ' + pageGroup);
  // console.log('first : ' + first);
  // console.log('last : ' + last);
  // console.log('prev : ' + prev);
  // console.log('next : ' + next);

  if(first < 1) first = 1;

  if(prev > 0) $('.pagination').append(`<li class="page-item" id="prev" value=${prev}><a class="page-link"> &lt; </a></li>`);

  for(let i=first; i <=last; i++){
    $('.pagination').append(`<li id='${i}' class="page-item"><a class="page-link page-num">${i}</a></li>`)
  }

  if(last < totalPage) $('.pagination').append(`<li class="page-item" id="next" value=${next}><a class="page-link"> &gt; </a></li>`);

  $(`#${currentPage}`).addClass('active');
}