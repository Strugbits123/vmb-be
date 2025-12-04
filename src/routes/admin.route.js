const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');


router.get('/get-pending-salons', protect('admin'), adminController.getPendingSalons);
router.get('/get-all-salons', protect('admin'), adminController.getAllSalons);
router.get('/get-weekly-stats', protect('admin'), adminController.getWeeklyStats);

router.patch('/approve-salon/:salonId', protect('admin'), adminController.approveSalon);
router.patch('/reject-salon/:salonId', protect('admin'), adminController.rejectSalon);
router.patch('/hold-salon/:salonId', protect('admin'), adminController.holdSalon);

module.exports = router;