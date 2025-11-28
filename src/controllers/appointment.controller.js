const appointmentService = require("../services/appointment.service")
const { ErrorHandler,
    getValidationErrorMessage,
    SuccessHandler } = require("../utils/responseHandler");


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


module.exports ={
    scheduleAppointment,
    getAppointmentDetails
}