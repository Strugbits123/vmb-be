// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  saloonOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  discount: { type: Number, default: 0 }, // percentage
  description: { type: String },
});

module.exports = mongoose.model('Service', serviceSchema);