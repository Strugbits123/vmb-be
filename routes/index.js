// routes/index.js
const express = require('express');
const router = express.Router();

router.use('/common', require('./common/auth'));
router.use('/customer', require('./customer/customer'));
router.use('/saloonowner', require('./saloonowner/saloon'));

module.exports = router;