const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const appointmentController = require('../controllers/appointment.controller');

router.patch("/schedule-appointment/:appointmentId", protect("salon-owner", "customer"), appointmentController.scheduleAppointment)
router.get("/get-appointment-details/:appointmentId", protect(), appointmentController.getAppointmentDetails)

module.exports = router;