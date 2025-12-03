const giftService = require("../services/gift.service");
const appointmentService = require("../services/appointment.service")
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");

const createGift = async (req, res) => {
    try {
        const giftData = req.body || {};
        giftData.requesterId = req.user.id;
        const result = await giftService.createGift(giftData);
        return SuccessHandler("Gift created successfully", result, 201, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const acceptGift = async (req, res) => {
    try {
        const giftId = req.params.giftId;
        const data = req.body || {};
        const isValidGift = await giftService.getGiftDetails(giftId);
        if (!isValidGift) {
            throw new Error('Gift not found');
        }

        if (isValidGift.status === 'declined'){
            throw new Error('Cannot accept a declined gift');
        }
        const appointment = await appointmentService.createAppointment(isValidGift, "gift")
        data.appointment = appointment._id
        const result = await giftService.acceptGift(giftId, data);
        return SuccessHandler("Gift accepted successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const rejectGift = async (req, res) => {
    try {
        const giftId = req.params.giftId;
        const result = await giftService.rejectGift(giftId);
        return SuccessHandler("Gift rejected successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const getRequestedGifts = async (req, res) => {
    try {
        const requesterId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || "newest";

        const result = await giftService.fetchGifts({ requesterId, page, limit, sort });
        return SuccessHandler("Requested gifts fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const getRecievedGifts = async (req, res) => {
    try {
        const receiverEmail = req.user.email;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || "newest";

        const result = await giftService.fetchGifts({ receiverEmail, page, limit, sort });
        return SuccessHandler("Received gifts fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const getAllGiftsForAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || "newest";

        const result = await giftService.fetchGifts({ page, limit, sort });
        return SuccessHandler("All gifts fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};


const getGiftDetails = async (req, res) => {
    try {
        const giftId = req.params.giftId;
        const result = await giftService.getGiftDetails(giftId);
        
        return SuccessHandler("Gift details fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }   
};

module.exports = {
    createGift,
    acceptGift,
    rejectGift,
    getRequestedGifts,
    getRecievedGifts,
    getAllGiftsForAdmin,
    getGiftDetails
};