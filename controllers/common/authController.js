 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');  
const Customer = require('../../models/Customer');
const SaloonOwner = require('../../models/SaloonOwner');
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

const registerCustomer = async (req, res) => {
  const { fullName, email, address, zipcode, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const customer = await Customer.create({
    fullName,
    email,
    address,
    zipcode,
    password: hashed,
  });

  const token = generateToken(customer._id, 'customer');

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    _id: customer._id,
    email: customer.email,
    role: 'customer',
  });
};

const registerSaloonOwner = async (req, res) => {
  const {
    fullName, email, address, zipcode, password, confirmPassword,
    saloonName, saloonAddress, saloonZipcode, phoneNumber,
    startTime, endTime, workingDays, description
  } = req.body;

  if (password !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const licenseDocument = req.files?.licenseDocument?.[0]?.location;
  const profilePic = req.files?.profilePic?.[0]?.location;
  const saloonPhotos = req.files?.saloonPhotos?.map(f => f.location) || [];

  // Use SaloonOwner model
  const owner = await SaloonOwner.create({
    fullName,
    email,
    address,
    zipcode,
    password: hashed,
    saloonName,
    saloonAddress,
    saloonZipcode: saloonZipcode || zipcode,
    phoneNumber,
    startTime,
    endTime,
    workingDays,
    licenseDocument,
    description,
    profilePic,
    saloonPhotos,
  });

  const token = generateToken(owner._id, 'saloon_owner');

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    _id: owner._id,
    email: owner.email,
    role: 'saloon_owner',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password'); 

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user._id, user.role);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    _id: user._id,
    email: user.email,
    role: user.role,
  });
};

const getCurrentUser = async (req, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email,
    role: req.user.role,
  });
};

module.exports = {
  registerCustomer,
  registerSaloonOwner,
  login,
  getCurrentUser,
};