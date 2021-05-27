const express = require('express');
const router = express.Router();
const controller = require('../controller/indexCont');

/* GET home page. */
router.get('/', controller.mainView);

module.exports = router;
