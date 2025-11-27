const inviteService = require("../services/invite.service");
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


const createInvite = async (req, res) => {
    try {
        const inviteData = req.body || {};
        inviteData.salonId = req.user.id;
        const result = await inviteService.createInvite(inviteData);
        return SuccessHandler("Invite created successfully", result, 201, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const claimInvite = async (req, res) => {
    try {
        const inviteId = req.params.inviteId;
        const data = req.body || {};
        const isValidInvite = await inviteService.getInviteDetails(inviteId);
        if (!isValidInvite) {
            throw new Error('Invite not found');
        }
        const result = await inviteService.claimInvite(inviteId, data);
        return SuccessHandler("Invite claimed successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};