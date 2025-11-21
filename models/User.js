// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "salonOwner", "admin"],
      required: true,
    },
  },
  { discriminatorKey: "role", timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
