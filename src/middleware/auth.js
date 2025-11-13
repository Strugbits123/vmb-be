

const jwt = require('jsonwebtoken');
const User = require('../models/User/user.model');
const { ErrorHandler } = require("../utils/responseHandler");

const protect = async (req, res, next) => {
            console.log("req", req);
            
    const token = req.cookies?.jwt;
    if (!token) return ErrorHandler(`Invalid or expired token`, 401, req, res);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) throw new Error('User not found');

        req.user = user;
        req.role = decoded.role;
        next();
    } catch (err) {
        return ErrorHandler(`User not authorized`, 401, req, res);
    }
};

const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return ErrorHandler(`Role ${req.user.role} not allowed`, 403, req, res);
    next();
};

module.exports = { protect, authorize };