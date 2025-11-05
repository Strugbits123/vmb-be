// controllers/common/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../../models/Customer');
const SaloonOwner = require('../../models/SaloonOwner');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const registerCustomer = async (req, res) => {
  const { fullName, email, address, zipcode, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

  const exists = await Customer.findOne({ email }) || await SaloonOwner.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const customer = await Customer.create({
    fullName, email, address, zipcode, password: hashed, role: 'customer'
  });

  res.status(201).json({
    _id: customer._id,
    email: customer.email,
    role: 'customer',
    token: generateToken(customer._id)
  });
};

const registerSaloonOwner = async (req, res) => {
  const {
    fullName, email, address, zipcode, password, confirmPassword,
    saloonName, saloonAddress, saloonZipcode, phoneNumber,
    startTime, endTime, workingDays, description
  } = req.body;

  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

  const exists = await Customer.findOne({ email }) || await SaloonOwner.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  // Get S3 URLs from multer-s3
  const licenseDocument = req.files?.licenseDocument?.[0]?.location;
  const profilePic = req.files?.profilePic?.[0]?.location;
  const saloonPhotos = req.files?.saloonPhotos?.map(f => f.location) || [];

  const owner = await SaloonOwner.create({
    fullName, email, address, zipcode, password: hashed,
    saloonName, saloonAddress, saloonZipcode: saloonZipcode || zipcode,
    phoneNumber, startTime, endTime, workingDays, licenseDocument,
    description, profilePic, saloonPhotos, role: 'saloon_owner'
  });

  res.status(201).json({
    _id: owner._id,
    email: owner.email,
    role: 'saloon_owner',
    token: generateToken(owner._id)
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const customer = await Customer.findOne({ email });
  const owner = await SaloonOwner.findOne({ email });
  const user = customer || owner;

  if (user && await bcrypt.compare(password, user.password)) {
    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

module.exports = { registerCustomer, registerSaloonOwner, login };  