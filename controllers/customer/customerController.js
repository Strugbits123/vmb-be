// controllers/customer/customerController.js
const GiftRequest = require('../../models/GiftRequest');
const Appointment = require('../../models/Appointment');
const Service = require('../../models/Service');

// Request Gift
const requestGift = async (req, res) => {
  const { saloonId, serviceId, gifterEmail, message } = req.body;
  const requesterId = req.user._id;

  const gift = await GiftRequest.create({
    requester: requesterId,
    gifterEmail,
    saloonOwner: saloonId,
    service: serviceId,
    message
  });

  res.status(201).json(gift);
};

// Book Appointment
const bookAppointment = async (req, res) => {
  const { serviceId, date, time, paymentMethod } = req.body;
  const customerId = req.user._id;

  const service = await Service.findById(serviceId);
  if (!service) return res.status(404).json({ message: 'Service not found' });

  const appointment = await Appointment.create({
    customer: customerId,
    saloonOwner: service.saloonOwner,
    service: serviceId,
    date,
    time,
    paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending'
  });

  res.status(201).json(appointment);
};

// Reschedule Appointment
const rescheduleAppointment = async (req, res) => {
  const { appointmentId, reason } = req.body;
  const customerId = req.user._id;

  const appointment = await Appointment.findOne({ _id: appointmentId, customer: customerId });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  appointment.status = 'rescheduled';
  appointment.rescheduleReason = reason;
  await appointment.save();

  res.json({ message: 'Reschedule request sent', appointment });
};

// EXPORT ALL
module.exports = { requestGift, bookAppointment, rescheduleAppointment };