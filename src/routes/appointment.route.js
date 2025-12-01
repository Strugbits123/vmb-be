const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const appointmentController = require('../controllers/appointment.controller');

router.get("/get-appointment-details/:appointmentId", protect(), appointmentController.getAppointmentDetails)
router.get("/get-user-appointment/", protect("customer"), appointmentController.getUserAppointments)
router.get("/get-salon-appointment/", protect("salon-owner"), appointmentController.getSalonAppointments)
router.get("/get-admin-appointment/", protect("admin"), appointmentController.getAdminAppointments)

router.patch("/schedule-appointment/:appointmentId", protect("salon-owner", "customer"), appointmentController.scheduleAppointment)
router.patch("/request-appointment-reschedule/:appointmentId", protect("customer"), appointmentController.requestAppointmentReschedule)
router.patch("/hold-appointment/:appointmentId", protect("customer"), appointmentController.holdAppointment)
router.patch("/decline-appointment/:appointmentId", protect("customer", "salon-owner"), appointmentController.declineAppointment)
router.patch("/confirm-appointment/:appointmentId", protect("customer", "salon-owner"), appointmentController.confirmAppointment)

module.exports = router;