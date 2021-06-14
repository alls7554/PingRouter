const express = require('express');
const router = express.Router();
const controller = require('../controller/mainCont');

/* GET main page. */
router.get('/', controller.mainView);

module.exports = router;
