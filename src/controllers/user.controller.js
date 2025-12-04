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

const getSalonById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.getSalonById(id);
    return SuccessHandler("Salon fetched successfully", result, 200, res, req);
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

const getAllSalons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const result = await userService.getAllSalons(page, limit, sort);
        return SuccessHandler("Requested gifts fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
}

const getSalonDailyStats = async (req, res) => {
    try {
        const id = req.user.id
        const result = await userService.getSalonDailyStats(id)
        return SuccessHandler("Details fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
}

module.exports = {
    getProfile,
    getUserById,
    updateProfile,
    updateSalonProfile,
    getAllSalons,
    getSalonById,
    getSalonDailyStats
}