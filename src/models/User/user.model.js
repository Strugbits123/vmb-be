const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const validator = require("validator");

dotenv.config({
  path: "./src/config/.env"
});


const userSchema = new Schema(

  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      validate: {
        validator: (value) => validator.isLength(value, { min: 3, max: 50 }),
        message: "Name must be between 3 and 50 characters",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please provide a valid email",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    zipcode: {
      type: String,
      required: [true, "Zipcode is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (value) {
          return validator.isLength(value, { min: 6 });
        },
        message: "Password must be at least 6 digits",
      }
    },
    role: {
      type: String,
      enum: ["customer", "salon-owner", "admin"],
      required: true,
      default: "customer",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hold", "deactivated"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    discriminatorKey: "role",
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: 3600 * 24 * 7 } // 7 days
  );
};

const user = mongoose.model("user", userSchema);
module.exports = user;
