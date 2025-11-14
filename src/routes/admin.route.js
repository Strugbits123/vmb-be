const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');


router.get('/get-pending-salons', protect('admin'), adminController.getPendingSalons);
router.patch('/approve-salon/:salonId', protect('admin'), adminController.approveSalon);
router.patch('/reject-salon/:salonId', protect('admin'), adminController.rejectSalon);
router.patch('/hold-salon/:salonId', protect('admin'), adminController.holdSalon);

module.exports = router;