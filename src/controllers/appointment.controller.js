const appointmentService = require("../services/appointment.service")
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


const createAppointment = async (req, res) => {
    try {

        const data = req.body || {};
        data.inviteeEmail = req.user.email
        const result = await appointmentService.createAndScheduleAppointment(data, "booking", data.startTime, data.appointmentDate, data.payment);
        return SuccessHandler("Appointment scheduled successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
}

const scheduleAppointment = async (req, res) => {
    try {

        const data = req.body || {};
        const userId = req.user.id;
        const appointmentId = req.params.appointmentId;
        const result = await appointmentService.scheduleAppointment(data, appointmentId);
        return SuccessHandler("Appointment scheduled successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
}

const getAppointmentDetails = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const result = await appointmentService.getAppointmentDetails(appointmentId);
        return SuccessHandler("Appointment details fetched successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res);
    }
}

const requestAppointmentReschedule = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const data = req.body || {};
        const result = await appointmentService.requestAppointmentReschedule(data.reason, appointmentId);
        return SuccessHandler("Reschedule request submitted successfully", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const holdAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const result = await appointmentService.holdAppointment(appointmentId);
        return SuccessHandler("Appointment placed on hold successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const declineAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const result = await appointmentService.declineAppointment(appointmentId);
        return SuccessHandler("Appointment declined successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const confirmAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const result = await appointmentService.confirmAppointment(appointmentId);
        return SuccessHandler("Appointment confrimed successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const getUserAppointments = async (req, res) => {
    try {
        const id = req.user.id
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const search = req.query.search || "";
        const status = req.query.status || "";
        const result = await appointmentService.getAppointments({
            userId: id,
            page,
            limit,
            sort,
            search,
            status
        });
        return SuccessHandler("Appointment fetched successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const getSalonAppointments = async (req, res) => {
    try {
        const id = req.user.id
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const search = req.query.search || "";
        const status = req.query.status || "";
        const result = await appointmentService.getAppointments({
            salonId: id,
            page,
            limit,
            sort,
            search,
            status
        });
        return SuccessHandler("Appointment fetched successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}

const getAdminAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'newest'
        const search = req.query.search || "";
        const status = req.query.status || "";
        const result = await appointmentService.getAppointments({
            isAdmin: true,
            page,
            limit,
            sort,
            search,
            status
        });
        return SuccessHandler("Appointment fetched successfully.", result, 200, res, req);
    } catch (error) {
        const message = getValidationErrorMessage(error);
        return ErrorHandler(message, 400, req, res)
    }
}


module.exports = {
    scheduleAppointment,
    getAppointmentDetails,
    requestAppointmentReschedule,
    holdAppointment,
    declineAppointment,
    getUserAppointments,
    getSalonAppointments,
    getAdminAppointments,
    confirmAppointment,
    createAppointment
}