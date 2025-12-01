const userService = require("../services/user.service");
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await userService.getUserById(userId);
        return SuccessHandler("User profile fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const updateProfile = async (req, res) => {
    try {        
        const userId = req.user.id;
        const updateData = req.body;
        const result = await userService.updateUser(userId, updateData);
        return SuccessHandler("User profile updated successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const updateSalonProfile = async (req, res) => {
    try {        
        const userId = req.user.id;
        const updateData = req.body;
        const result = await userService.updateSalon(userId, updateData);
        return SuccessHandler("Salon profile updated successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await userService.getUserById(id);
        return SuccessHandler("User fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

module.exports = {
    getProfile,
    getUserById,
    updateProfile,
    updateSalonProfile
}