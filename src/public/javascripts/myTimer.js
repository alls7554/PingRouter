let hour, minute, second;

timeSet = () => {

  hour = $('#Hours').val();
  minute = $('#Minutes').val();
  second = $('#Seconds').val();

  if(hour == '' && minute == '' && second == '') return;

  time = parseInt((hour * 3600) + (minute * 60) + second);

  if(hour == '' || hour == '0') hour = '0'
  if(minute == '' || minute == '0') minute = '0'
  if(second == '' || second == '0') second = '0'
  
  doc.getElementById('hour').innerHTML = hour;
  doc.getElementById('minute').innerHTML = minute;
  doc.getElementById('second').innerHTML = second;

  return true;
}

timeReset = () => {
  doc.getElementById('Hours').value = '',
  doc.getElementById('Minutes').value = '',
  doc.getElementById('Seconds').value = '';
  doc.getElementById('hour').innerHTML = '0';
  doc.getElementById('minute').innerHTML = '0';
  doc.getElementById('second').innerHTML = '0';
}