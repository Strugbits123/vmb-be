// routes/saloonowner/saloon.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const {
  addService,
  inviteCustomer,
  viewAppointments
} = require('../../controllers/saloonowner/saloonController');

// Protect all routes & restrict to 'saloon_owner' role
router.use(protect, authorize('saloon_owner'));

/**
 * @route   POST /api/saloonowner/service
 * @desc    Add a new service
 * @body    { name, price, duration, discount, description }
 */
router.post('/service', addService);

/**
 * @route   POST /api/saloonowner/invite
 * @desc    Invite a customer (sends email via SendGrid)
 * @body    { inviteeEmail, firstName, lastName, serviceId, discount, message }
 */
router.post('/invite', inviteCustomer);

/**
 * @route   GET /api/saloonowner/appointments
 * @desc    View all appointments for this saloon
 */
router.get('/appointments', viewAppointments);

module.exports = router;