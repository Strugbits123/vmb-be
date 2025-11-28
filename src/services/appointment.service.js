const sendMail = require("../utils/sendMail");
const User = require("../models/User/user.model");
const Service = require("../models/Service/salon-service.model.js")
const Appointment = require('../models/Appointment/appointment.model');
const { validateSalonOperatingHours } = require("../utils/util.js");

const createAppointment = async (data, type, startTime = null, appointmentDate = null) => {
    const { salonId, services, requesterId, receiverEmail } = data;

    if (!services || !Array.isArray(services) || services.length === 0) {
        throw new Error("At least one service must be selected");
    }

    const salon = await User.findById(salonId)
        .select("salonName description profilePic")
        .lean();

    const user = await User.findOne({ email: receiverEmail })
        .select("_id")
        .lean();


    if (!salon) {
        throw new Error("No Salon Found");
    }

    if (!user) {
        throw new Error("Unable to be details of the user from which gift was requested")
    }

    const servicesInfo = await Service.find({ _id: { $in: services } })
        .select("serviceName servicePrice serviceDuration")
        .lean();

    if (servicesInfo.length !== services.length) {
        throw new Error("One or more selected services are invalid");
    }

    const obj = {}

    obj.Salon = {
        id: salonId,
        name: salon.salonName,
        description: salon.description,
        image: salon.profilePic
    };

    obj.RequestedBy = requesterId
    obj.RequestedFrom = user._id
    obj.sourceType = type
    obj.startTime = startTime
    obj.appointmentDate = appointmentDate

    obj.services = servicesInfo.map(s => ({
        serviceId: s._id,
        name: s.serviceName,
        price: s.servicePrice,
        duration: s.serviceDuration
    }));

    const event = type === 'gift' ? "Appointment Requested" : "Appointment Created"
    const tag = type === 'gift' ? "requested" : "created"

    obj.timeline = [{
        event,
        description: "Appointment was created successfully",
        tag
    }];

    const appointment = new Appointment(obj);
    await appointment.save();

    console.log("this appointment", appointment);

    return appointment;
};


const scheduleAppointment = async (data, id) => {
    const { startTime, appointmentDate } = data;

    if (!startTime || !appointmentDate) {
        throw new Error("Start time and appointment date are required to schedule an appointment");
    }

    const today = new Date().toISOString().split("T")[0];

    if (appointmentDate < today) {
        throw new Error("Appointment date cannot be in the past");
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new Error("Not a valid appointment");
    }

    const user = await User.findById(appointment.Salon.id)
        .select("startTime endTime workingDays")
        .lean();

    if (!user) {
        throw new Error("Unable to fetch salon details")
    }


    const isValid = await validateSalonOperatingHours(appointmentDate, startTime, user)
    if (!isValid) return


    appointment.startTime = startTime;
    appointment.appointmentDate = appointmentDate;
    appointment.status = "scheduled";

    appointment.timeline.push({
        event: "Appointment Scheduled",
        description: `Appointment scheduled successfully`,
        tag: "scheduled"
    });

    await appointment.save();

    return appointment;
};

const getAppointmentDetails = async (id) => {
    const appointment = await Appointment.findById(id)
        .populate({
            path: "RequestedBy",
            select: "name email phoneNumber profilePic"
        })
        .populate({
            path: "RequestedFrom",
            select: "name email phoneNumber profilePic"
        })
        .lean(); // returns plain JS object

    if (!appointment) {
        throw new Error("Not a valid appointment");
    }

    // Calculate total price based on services snapshot
    const totalPrice = appointment.services.reduce((sum, s) => sum + s.price, 0);

    return {
        ...appointment,
        totalPrice
    };
};


module.exports = {
    createAppointment,
    scheduleAppointment,
    getAppointmentDetails
}
