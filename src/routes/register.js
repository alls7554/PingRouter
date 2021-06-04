const express = require('express');
const router = express.Router();
const controller = require('../controller/registerCont');

/* GET register page. */
router.get('/', controller.mainView);

router.post('/check/:id', controller.id_check);

router.post('/regist', controller.regist);

module.exports = router;
