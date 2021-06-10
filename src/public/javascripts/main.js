
const doc = document;
const myapp = io();

const ctx = doc.getElementById('myChart');

let myChart =new Chart(ctx, options);

let trOn, pingOn;
let totalTime = false;  // Timer 설정 유무 파악
let startTime;  // 테스트 시작 시간

$('#start').click(() => {
  let target = $('#Address').val();
  if(target == ''){
    alert('input ip.v4 address')
    return;
  }
  trOn = true;
  pingOn = true;

  startDisabled();

  if(!totalTime){
    $('#stop').attr('disabled', false);
  } else {
    myTimer = setInterval(() => {
      hour = parseInt(time/3600),
      minute = parseInt(time/60),
      second = time%60;

      doc.getElementById('hour').innerHTML = hour;
      doc.getElementById('minute').innerHTML = minute;
      doc.getElementById('second').innerHTML = second;

      time-=1;

      if(time < 0){
        clearInterval(myTimer);
        myapp.emit('stop');
        $('#stop').attr('disabled', true);
        totalTime = false;
        if(!trOn){
          stopDisabled();
        }
      } 
  }, 1000);
  }
  myapp.emit('start', target);
});

myapp.on('STARTTIME', (time) => {
  startTime = time.replace(/T/g, ' ');
  startTime = startTime.replace(/\+09:00/g, '');
})

myapp.on('pingProcess', (address, obj) => {
  let icmp_seq = obj.icmp_seq,
      speed = obj.time;

  $('#ping_textLog_list').append(`<li class='list-group-item pingLog'><span>${address}: icmp_seq=${icmp_seq} time=${speed}ms</span></li>`);
  // 스크롤바 아래 고정
  $('div.ping_textLog').scrollTop($('div.ping_textLog').prop('scrollHeight'));
});

$('#stop').click(() => {
  myapp.emit('stop', $('#Address').val());
  $('#stop').attr('disabled', true);

  if(!trOn){
    stopDisabled();
  }
});

myapp.on('result', (obj) => {
  pingOn = false;

  let cnt = obj.cnt,
      max = obj.max,
      avg = obj.avg,
      min = obj.min
  
  $('#ping_textLog_list').append(`<li class='list-group-item list-group-item-success pingResultLog'><span>--- ping statistics ---</span></li>`);
  $('#ping_textLog_list').append(`<li class='list-group-item pingResultLog'><span>${cnt} packets transmitted, ${cnt} packets received</span></li>`);
  $("#ping_textLog_list").append(`<li class='list-group-item pingResultLog'><span>round-trip min/avg/max = ${min}/${avg}/${max} (ms)</span></li>`);
  // 스크롤바 아래 고정
  $('div.ping_textLog').scrollTop($('div.ping_textLog').prop('scrollHeight'));
});

myapp.on('pingGraph', (obj, avg) => {
  let icmp_seq = obj.icmp_seq,
      time = obj.time;

  addData(myChart, icmp_seq, time, avg);
});

$('#reset').click(() => {
  resetDisabled();
  doc.getElementById('Address').value = '';
  doc.getElementById('Hours').value = '';
  doc.getElementById('Minutes').value = '';
  doc.getElementById('Seconds').value = '';
  $('.pingLog').remove();
  $('.pingResultLog').remove();
  $('.trLog').remove();
  $('.trResultlog').remove();
  myChart.update('reset');
  resetData(myChart);
});
// End Ping

// TraceRouter
myapp.on('trDestination', (destination)=>{
  $('#trLog_list').append(`<li class='list-group-item trLog'><span>${destination}</span></li>`);
});

myapp.on('trProcess', (trResult) => {
  let hop = trResult.hop,
      router = trResult.ip,
      time = trResult.rtt1;

  $('#trLog_list').append(`<li class='list-group-item trLog'><span>${hop} ${router} ${time}</span></li>`);
  $('div.tr_log').scrollTop($('div.tr_log').prop('scrollHeight'));
});

myapp.on('trClose', (code) => {
  $('#trLog_list').append(`<li class='list-group-item trResultlog'><span>Close : ${code}</span></li>`);
  $('div.tr_log').scrollTop($('div.tr_log').prop('scrollHeight'));
  trOn = false;
  if(!pingOn){
    trDisabled();
  }
});
// End TraceRouter

// Timer
$('#timeSet').click(() => {
  totalTime = timeSet();
  timeSetDisabled();
});

$('#timeReset').click(() => {
  timeReset();
  timeResetDisabled();
});

// Save
$('#save').on('click', () => {

  let pingLogs = doc.getElementsByClassName('pingLog');
  let pingResultLogs = doc.getElementsByClassName('pingResultLog');
  let trLogs = doc.getElementsByClassName('trLog');
  let pingResult = {
    title : [],
    packet: [],
    rtt : []
  };
  pingResult.title.push(pingResultLogs[0].innerText)
  pingResult.packet.push(pingResultLogs[1].innerText)
  pingResult.rtt.push(pingResultLogs[2].innerText)
  
  let data = downloadReady(pingLogs, pingResult, trLogs);
  download(startTime, data);
});

$('#history').click(() => {
  location.href = `/history`
});