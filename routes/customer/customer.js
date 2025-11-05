// routes/customer/customer.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
  requestGift,
  bookAppointment,
  rescheduleAppointment
} = require('../../controllers/customer/customerController');

// Protect all routes & restrict to 'customer' role
router.use(protect, authorize('customer'));

/**
 * @route   POST /api/customer/gift
 * @desc    Request a gift from another customer
 * @body    { saloonId, serviceId, gifterEmail, message }
 */
router.post('/gift', requestGift);

/**
 * @route   POST /api/customer/appointment
 * @desc    Book an appointment
 * @body    { serviceId, date, time, paymentMethod }
 */
router.post('/appointment', bookAppointment);

/**
 * @route   POST /api/customer/appointment/reschedule
 * @desc    Request to reschedule appointment
 * @body    { appointmentId, reason }
 */
router.post('/appointment/reschedule', rescheduleAppointment);

module.exports = router;