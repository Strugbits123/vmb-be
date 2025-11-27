const mongoose = require("mongoose");
const User = require("./User");

const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
});

module.exports = User.discriminator("admin", adminSchema);
