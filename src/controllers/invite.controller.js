const inviteService = require("../services/invite.service")
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


module.exports = {
    createInvite
}