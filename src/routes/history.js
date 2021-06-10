const express = require('express');
const router = express.Router();
const controller = require('../controller/historyCont')

// Enter history Page
router.get('/', controller.mainView);

// pagination
router.get('/pages/:page', controller.paging);

// date Filter
router.get('/date/:period', controller.dateFilter);

// address search
router.get('/search/:address', controller.addressSearch);

// date Filter + address search
router.get('/date/:period/search/:address', controller.dateAndaddress);

// specific log
router.get('/select/:startTime', controller.specificLog);

module.exports = router;