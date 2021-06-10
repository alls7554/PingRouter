const express = require('express');
const router = express.Router();
const controller = require('../controller/indexCont');

/* GET home page. */
router.get('/', controller.mainView);

router.post('/login', controller.login);

router.get('/logout', controller.logout);

router.get('/register', controller.register);

module.exports = router;