const adminService = require("../services/admin.service");
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


const getPendingSalons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await adminService.getPendingSalons(page, limit);
        return SuccessHandler("Pending salons fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};


const approveSalon = async (req, res) => {
    try {
        const { salonId } = req.params;
        const result = await adminService.approveSalon(salonId);
        return SuccessHandler("Salon approved successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const rejectSalon = async (req, res) => {
    try {
        const { salonId } = req.params;
        const result = await adminService.rejectSalon(salonId);
        return SuccessHandler("Salon rejected successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const holdSalon = async (req, res) => {
    try {
        if(!req.body || !req.body.reason) throw new Error('Hold reason is required');
        const { salonId } = req.params;
        const { reason } = req.body;
        const result = await adminService.holdSalon(salonId, reason);
        return SuccessHandler("Salon put on hold successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

module.exports = {
    getPendingSalons,
    approveSalon,
    rejectSalon,
    holdSalon
}