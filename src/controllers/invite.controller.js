const inviteService = require("../services/invite.service")
const appointmentService = require("../services/appointment.service")
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

const getInvite = async (req, res) => {
    try {
        const inviteId = req.params.id;
        const result = await inviteService.getFullInviteDetails(inviteId);
        return SuccessHandler("Details fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const acceptInvite = async (req, res) => {
    try {
        const inviteId = req.params.inviteId;
        const data = req.body || {};
        const isValidInvite = await inviteService.getInviteDetails(inviteId)
        if (!isValidInvite) {
            throw new Error("Invite not found")
        }

        if (isValidInvite.status === 'unclaimed') {
            throw new Error("Cannot accept a uncalimed invite")
        }

        if(isValidInvite.status === 'claimed'){
            throw new Error("Cannot claim a already claimed gift")
        }

        console.log("invite", isValidInvite);
        const appointment = await appointmentService.createAndScheduleAppointment(isValidInvite, "invite", data.startTime, data.appointmentDate)

        data.appointment = appointment._id
        const result = await inviteService.acceptInvite(inviteId, data)

        return SuccessHandler("Invite accepted successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
};

const getUserInvites = async (req, res) => {
    try {
        console.log("id", req.user.email);
        
        const id = req.user.email
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const search = req.query.search || "";
        const status = req.query.status || "";
        const result = await inviteService.getInvites({
            userId: id,
            page,
            limit,
            sort,
            search,
            status
        });
        return SuccessHandler("Invites fetched successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const getSalonInvites = async (req, res) => {
    try {
        const id = req.user.id
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const search = req.query.search || "";
        const status = req.query.status || "";
        const result = await inviteService.getInvites({
            salonId: id,
            page,
            limit,
            sort,
            search,
            status
        });
        return SuccessHandler("Invites fetched successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const getAdminInvites = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const search = req.query.search || "";
        const status = req.query.status || "";
        const result = await inviteService.getInvites({
            isAdmin: true,
            page,
            limit,
            sort,
            search,
            status
        });
        return SuccessHandler("Invites fetched successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}


module.exports = {
    createInvite,
    acceptInvite,
    getUserInvites,
    getSalonInvites,
    getAdminInvites,
    getInvite
}