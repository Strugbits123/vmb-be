const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require('crypto');


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
      immutable: true,
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
      immutable: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hold", "deactivated"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    phoneNumber: {
      type: String,
      default: "",
      validator: (value) => {
        if (value === "") return true;
        return validator.isMobilePhone(value, "en-US");
      }
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
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

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: 3600 * 24 * 30 } // 30 days
  );
};

const user = mongoose.model("user", userSchema);
module.exports = user;
