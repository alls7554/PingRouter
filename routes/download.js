var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');
var mime = require('mime');

router.get('/:id', (req, res, next) => {

  let upload_folder = path.join(__dirname, '../');

  let file = upload_folder + req.params.id+'.xlsx';

  try {
    if(fs.existsSync(file)){
      let filename = path.basename(file);
      let mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      if (!res.getHeader("content-type")) {
        var charset = mime.charsets.lookup(mimetype);
        res.setHeader(
          "Content-Type",
          mimetype + (charset ? "; charset=" + charset : "")
        );
      }


      let filestream = fs.createReadStream(file);
      filestream.pipe(res);
    } else {
      res.send('해당 파일이 존재하지 않습니다.');
      return;
    }
  } catch (error) {
    console.log(error);
    res.send('파일을 다운로드 하는 중에 에러가 발생하였습니다.');
    return;
  }
});

module.exports = router;