// models/Invitation.js
const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  saloonOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inviteeEmail: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  discount: { type: Number, default: 0 },
  message: { type: String },
  status: { type: String, enum: ['sent', 'accepted', 'used'], default: 'sent' },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);