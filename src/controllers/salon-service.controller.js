const salonService = require("../services/salon-service.service");
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


const createSalonService = async (req, res) => {
    try {
        const salonServiceData = req.body || {};
        salonServiceData.salonId = req.user.id;
        const result = await salonService.createSalonService(salonServiceData);
        return SuccessHandler("Salon service created successfully", result, 201, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const getSalonServices = async (req, res) => {
    try {
        // const salonId = req.user.id;
        const salonId = req.params.id || req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const result = await salonService.getSalonServicesBySalonId(page, limit, salonId, sort);
        return SuccessHandler("Salon services fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const updateSalonService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const updateData = req.body;
        const result = await salonService.updateSalonService(serviceId, updateData);
        return SuccessHandler("Salon service updated successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const deleteSalonService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        await salonService.deleteSalonService(serviceId);
        return SuccessHandler("Salon service deleted successfully", null, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

module.exports = {
    createSalonService,
    getSalonServices,
    updateSalonService,
    deleteSalonService,
};