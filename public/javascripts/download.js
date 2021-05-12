downloadReady = (pingLogs, pingResult, trLogs) => {
  let data = {
    pingLog : [],
      trLog : []
  }

  data.pingLog.push(['Address', 'icmp_seq', 'Time'])
  for(idx in pingLogs) {
    let log = pingLogs[idx].innerText;
    if(log){
      tmp = log.replace(/ /g, '');
      tmp = tmp.split(/:icmp_seq=|time=/g);
      data.pingLog.push(tmp);
    }
  }

  data.pingLog.push(pingResult.title)
  data.pingLog.push(pingResult.packet)
  data.pingLog.push(pingResult.rtt)

  data.trLog.push(['Hops', 'Address', 'Time'])
  for (idx in trLogs) {
    let log = trLogs[idx].innerText;
    if(log){
      tmp = log.replace(/ ms/g, 'ms')
      tmp = tmp.split(/ /g);
      data.trLog.push(tmp);
    }
  }

  return data;
}

let excelHandler = {
  getExcelFileName : (startTime) => {
      return startTime+'.xlsx';
  },
  getSheetName : (sheetName) => {
      return sheetName;
  },
  getWorksheet : (data) => {
      return XLSX.utils.json_to_sheet(data, {skipHeader:true});
  }
}

download = (startTime, data) => {

  let pingLogs = [],
      trLogs = [];

  for(idx in data.pingLog){
  pingLogs.push(data.pingLog[idx]);
  }

  for(idx in data.trLog){
  trLogs.push(data.trLog[idx]);
  }

  // step 1. workbook 생성
  let wb = XLSX.utils.book_new();

  // step 2. 시트 만들기 
  let PingLog = excelHandler.getWorksheet(pingLogs);
  let TraceRouter = excelHandler.getWorksheet(trLogs);

  // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
  XLSX.utils.book_append_sheet( wb, PingLog, "PINGLOG" );
  XLSX.utils.book_append_sheet( wb, TraceRouter, "TRACEROUTELOG" );

  // step 4. 엑셀 파일 만들기 
  let wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

  // step 5. 엑셀 파일 내보내기 
  saveAs(new Blob([s2ab(wbout)], {type:"application/octet-stream"}), excelHandler.getExcelFileName(startTime));
}

s2ab = (s) => { 
  let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  let view = new Uint8Array(buf);  //create uint8array as viewer
  for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
  return buf;    
}