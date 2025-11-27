const authService = require("../services/auth.service");
const walletService = require("../services/wallet.service");
const utils = require("../utils/util");
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


const registerCustomer = async (req, res) => {
    try {
        const { name, email, address, zipcode, password, confirmPassword } = req.body;
        const result = await authService.registerCustomer({ name, email, address, zipcode, password, confirmPassword });
        utils.setAuthCookie(res, result.token);
        const wallet = await walletService.createWallet({ userId: result.user._id, balance: 0 });
        return SuccessHandler("Customer registered successfully", result, 201, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const registerSalonOwner = async (req, res) => {
    try {
        const result = await authService.registerSalonOwner(req.body);
        return SuccessHandler("Your acccount is awaiting approval. You will be notified via email.", result, 201, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        utils.setAuthCookie(res, result.token);
        return SuccessHandler("Login successful", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const logout = (req, res) => {
    res.clearCookie('jwt');
    return SuccessHandler("Logout successful", null, 200, res, req);
};


const forgotPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.email) throw new Error('Email is required');
        const { email } = req.body;
        console.log("email", email);

        const result = await authService.forgotPassword(email);
        return SuccessHandler("Password reset email sent successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const resetPassword = async (req, res) => {
    try {
        if (!req.body || !req.body.newPassword || !req.body.confirmPassword) {
            throw new Error('New password and confirm password are required');
        }
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword, confirmPassword);
        return SuccessHandler("Password has been reset successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const changePassword = async (req, res) => {
    try {
        if (!req.body || !req.body.newPassword || !req.body.confirmPassword || !req.body.currentPassword) {
            throw new Error('All password fields are required');
        }
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id; // set by protect middleware

        const result = await authService.changePassword(userId, currentPassword, newPassword, confirmPassword);

        return SuccessHandler('Password changed successfully', result, 200, res, req);
    } catch (err) {
        const message = getValidationErrorMessage(err);
        return ErrorHandler(message || 'Something went wrong', 400, req, res);
    }
};


module.exports = { registerCustomer, registerSalonOwner, login, logout, forgotPassword, resetPassword, changePassword };

