// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  saloonOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "14:30"
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'], 
    default: 'pending' 
  },
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  rescheduleReason: { type: String },
  proposedNewTime: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);