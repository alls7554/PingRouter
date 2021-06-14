const express = require('express');
const router = express.Router();
const controller = require('../controller/registerCont');


router.post('/check/:id', controller.id_check);

router.post('/regist', controller.regist);

module.exports = router;
