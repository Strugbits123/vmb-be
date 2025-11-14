const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/signup-customer', authController.registerCustomer);
router.post('/signup-salonowner', authController.registerSalonOwner);

router.post('/signin', authController.login);
router.post('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/change-password', protect(), authController.changePassword);

module.exports = router;