// models/SaloonOwner.js
const mongoose = require("mongoose");
const User = require("./User");

const saloonOwnerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String },
  zipcode: { type: String },
  saloonName: { type: String, required: true },
  saloonAddress: { type: String, required: true },
  saloonZipcode: { type: String },
  phoneNumber: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  workingDays: [{ type: String }],
  licenseDocument: { type: String },
  description: { type: String },
  profilePic: { type: String },
  saloonPhotos: [{ type: String }],
});

module.exports = User.discriminator("salonOwner", saloonOwnerSchema);
