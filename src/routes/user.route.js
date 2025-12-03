const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/user.controller');


router.get('/get-profile', protect(), userController.getProfile);

router.get('/get-all-salons', protect(), userController.getAllSalons);
router.get('/get-user-by-id/:id', protect('admin'), userController.getUserById);

router.patch('/update-profile', protect(), userController.updateProfile);          
router.patch('/update-salon-profile', protect("salon-owner"), userController.updateSalonProfile);          


module.exports = router;
