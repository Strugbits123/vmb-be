const User = require("../models/User/user.model");
const SalonOwner = require("../models/User/salon-owner.model");
const sendMail = require("../utils/sendMail");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const registerCustomer = async ({ name, email, address, zipcode, password, confirmPassword }) => {
  if (password !== confirmPassword) throw new Error("Passwords do not match");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email is already taken. Please enter a different email.");

  const user = await User.create({
    name, email, address, zipcode, password, status: "approved"
  });

  const token = user.getSignedJwtToken();

  const userObj = user.toObject();
  delete userObj.password;
  return { token, user: userObj };
};

const registerSalonOwner = async (data) => {
  const { email, password, confirmPassword } = data;
  if (password !== confirmPassword) throw new Error("Passwords do not match");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email is already taken. Please enter a different email.");

  const salonOwner = await SalonOwner.create({
    ...data,
    role: "salon-owner",
    status: "pending",
  });

  return {};
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("No user found with this email");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Please enter a valid password");

  if (user.status !== "approved" && user.status !== "hold")
    throw new Error(`User status is ${user.status}. Access denied.`);

  const token = user.getSignedJwtToken();

  const userObj = user.toObject();
  delete userObj.password;

  return { token, user: userObj };
};

const forgotPassword = async (email) => {

  if(!email) throw new Error('Email is required');

  const user = await User.findOne({ email });
  if (!user) throw new Error('No user found with this email');

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendMail({
    to: user.email,
    templateId: process.env.SENDGRID_FORGOT_PASSWORD_TEMPLATE_ID,
    templataData: {
      name: user.name,
      reset_url: resetUrl
    },
  });

  return { resetUrl };
};

const resetPassword = async (token, newPassword, confirmPassword) => {
  
  if (newPassword !== confirmPassword) throw new Error('Passwords do not match');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new Error('Invalid or expired password reset token');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return {};
};

const changePassword = async (userId, currentPassword, newPassword, confirmPassword) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('All fields are required');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match');
  }

  if (newPassword === currentPassword) {
    throw new Error('New password must be different from the current password');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  user.password = newPassword;
  await user.save();

  return {};
};

module.exports = { registerCustomer, registerSalonOwner, login, forgotPassword, resetPassword, changePassword };
