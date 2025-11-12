const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  registerSalonOwner,
  login,
  logout
} = require('../controllers/auth.controller');



router.post('/signup-customer', registerCustomer);
router.post('/signup-salonowner', registerSalonOwner);
router.post('/signin', login);
router.post('/logout', logout);

module.exports = router;