// models/Customer.js
const mongoose = require('mongoose');
const User = require('./User');

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String },
  zipcode: { type: String },
});

module.exports = User.discriminator('customer', customerSchema);