const User = require("../models/User/user.model");
const Salonowner = require("../models/User/salon-owner.model");
const SuccessHandler = require("../utils/successHandler");
const { ErrorHandler, getValidationErrorMessage } = require("../utils/errorHandler");
// const getValidationErrorMessage = require("../utils/errorHandler");
const dotenv = require("dotenv");

dotenv.config({
    path: './src/config/.env'
});

// Register Customer
const registerCustomer = async (req, res) => {
    try {
        const { name, email, address, zipcode, password, confirmPassword } = req.body;
        console.log(req.body);

        if (password !== confirmPassword) {
            return ErrorHandler("Passwords do not match", 400, req, res);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return ErrorHandler("Email already in use", 400, req, res);
        }

        const user = await User.create({
            name,
            email,
            address,
            zipcode,
            password,
            status: 'approved'
        });

        const token = user.getSignedJwtToken();
        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        res.cookie('jwt', token, cookieOptions);

        return SuccessHandler("Customer registered successfully", {token, user}, 201, res);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const registerSalonOwner = async (req, res) => {
    try {
        const { name,
            email,
            address,
            zipcode,
            password,
            confirmPassword,
            salonName,
            salonAddress,
            salonZipcode,
            phoneNumber,
            startTime,
            endTime,
            workingDays,
            licenseDocument,
            description,
            profilePic,
            salonPhotos
        } = req.body;

        if (password !== confirmPassword) {
            return ErrorHandler("Passwords do not match", 400, req, res);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return ErrorHandler("Email already in use", 400, req, res);
        }
        
        const salonowner = await Salonowner.create({
            name,
            email,
            address,
            zipcode,
            password,
            role: 'salon-owner',
            status: 'pending',
            salonName,
            salonAddress,
            salonZipcode,
            phoneNumber,
            startTime,
            endTime,
            workingDays,
            licenseDocument,
            description,
            profilePic,
            salonPhotos
        });

        return SuccessHandler("User registered successfully", salonowner, 201, res);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return ErrorHandler("User not found", 401, req, res);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return ErrorHandler("Invalid Password", 401, req, res);
        }
        // Check if user is approved 
        if (user.status !== 'approved') {
            return ErrorHandler(`User status is ${user.status}. Access denied.`, 403, req, res);
        }
        
        const token = user.getSignedJwtToken();
        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        res.cookie('jwt', token, cookieOptions);

        return SuccessHandler("Login successful", { token, user }, 200, res);
    } catch (error) {
        return ErrorHandler(error.message, 500, req, res);
    }
};

// Logout User
const logout = (req, res) => {
    res.clearCookie('jwt');
    return SuccessHandler("Logout successful", null, 200, req, res);
};

module.exports = {
    registerCustomer,
    registerSalonOwner,
    login,
    logout
};