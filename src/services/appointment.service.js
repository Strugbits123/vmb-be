// const sendMail = require("../utils/sendMail");
const mongoose = require("mongoose")
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


    return appointment;
};

const createAndScheduleAppointment = async (data, type, startTime, appointmentDate, payment = null) => {
    const { salonId, services, inviteeEmail } = data;

    if (type === 'booking' && !payment) {
        throw new Error("Payment Info is required to create an appointment")
    }

    if (!services) {
        throw new Error("Service must be selected");
    }

    const salon = await User.findById(salonId)
        .select("salonName description profilePic startTime endTime workingDays")
        .lean();

    const user = await User.findOne({ email: inviteeEmail })
        .select("_id")
        .lean();

    if (!salon) {
        throw new Error("No Salon Found");
    }

    if (!user) {
        throw new Error("Unable to get details of the user to which invite was sent");
    }

    // const serviceInfo = await Service.findById(services)
    //     .select("serviceName servicePrice serviceDuration")
    //     .lean();

    // if (!serviceInfo) {
    //     throw new Error("Selected service is invalid");
    // }

    const serviceIds = type === "invite"
        ? [services]
        : Array.isArray(services)
            ? services
            : (() => { throw new Error("Services must be an array for booking"); })();

    const serviceDocs = await Service.find({ _id: { $in: serviceIds } })
        .select("serviceName servicePrice serviceDuration")
        .lean();


    if (serviceDocs.length !== serviceIds.length) {
        throw new Error("One or more selected services are invalid");
    }


    if (!startTime || !appointmentDate) {
        throw new Error("Start time and appointment date are required to schedule an appointment");
    }

    const isValid = await validateSalonOperatingHours(appointmentDate, startTime, salon);
    if (!isValid) return;

    const obj = {};

    obj.Salon = {
        id: salonId,
        name: salon.salonName,
        description: salon.description,
        image: salon.profilePic
    };

    obj.RequestedBy = user._id;
    obj.RequestedFrom = salonId;
    obj.sourceType = type;
    obj.startTime = startTime;
    obj.appointmentDate = appointmentDate;
    obj.status = "scheduled"

    obj.services = serviceDocs.map(s => ({
        serviceId: s._id,
        name: s.serviceName,
        price: s.servicePrice,
        duration: s.serviceDuration
    }));

    obj.timeline = [{
        event: "Appointment Created",
        description: "Appointment was created successfully",
        tag: "scheduled"
    }];



    const appointment = new Appointment(obj);
    await appointment.save();
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

    const isReschedule = appointment.status === "reschedule-requested";

    appointment.startTime = startTime;
    appointment.appointmentDate = appointmentDate;
    appointment.status = "scheduled";

    appointment.timeline.push({
        event: isReschedule ? "Appointment Rescheduled" : "Appointment Scheduled",
        description: isReschedule
            ? "Appointment rescheduled successfully."
            : "Appointment scheduled successfully.",
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


const requestAppointmentReschedule = async (data, id) => {
    const appointment = await Appointment.findById(id)
    if (!appointment) {
        throw new Error("Not a valid appointment")
    }

    if (appointment.status !== 'scheduled' && appointment.status !== 'hold') {
        throw new Error('Cannot request a appointment which is not scheduled')
    }

    if (!data || data.trim() === "") {
        throw new Error("Please provide a reason for reschdule request")
    }

    appointment.status = "reschedule-requested"
    appointment.reschduleReason = data

    appointment.timeline.push({
        event: "Appointment Reschedule Requested",
        description: `Request for appointment reschedule submitted successfully.`,
        tag: "reschedule-requested"
    });

    await appointment.save();
    return appointment;
}

const holdAppointment = async (id) => {
    const appointment = await Appointment.findById(id)
    if (!appointment) {
        throw new Error("Not a valid appointment")
    }

    appointment.status = "hold"
    appointment.reschduleReason = ""
    appointment.startTime = null
    appointment.appointmentDate = null

    appointment.timeline.push({
        event: "Appointment Placed on Hold",
        description: `The appointment has been successfully placed on hold.`,
        tag: "hold"
    });

    await appointment.save();
    return appointment;
}

const declineAppointment = async (id) => {
    const appointment = await Appointment.findById(id)
    if (!appointment) {
        throw new Error("Not a valid appointment")
    }

    appointment.status = "declined"
    appointment.reschduleReason = ""
    appointment.startTime = null
    appointment.appointmentDate = null

    appointment.timeline.push({
        event: "Appointment Declined",
        description: `The appointment has been declined.`,
        tag: "declined"
    });

    await appointment.save();
    return appointment;
}

const confirmAppointment = async (id) => {
    const appointment = await Appointment.findById(id)
    if (!appointment) {
        throw new Error("Not a valid appointment")
    }


    const today = new Date().toISOString().split("T")[0];

    if (appointment?.appointmentDate) {
        throw new Error("Appointment date not available.");
    }

    if (appointment.appointmentDate < today) {
        throw new Error("Appointment date cannot be in the past. Please request a reschedule instead");
    }

    if (!["scheduled", "pending"].includes(appointment.status)) {
        throw new Error("Only scheduled or pending appointments can be confirmed.");
    }

    appointment.status = "confirmed"
    appointment.reschduleReason = ""

    appointment.timeline.push({
        event: "Appointment Confirmed",
        description: `The appointment has been confirmed.`,
        tag: "accepted"
    });

    await appointment.save();
    return appointment;
}

// const getAppointments = async ({
//     userId = null,
//     salonId = null,
//     isAdmin = false,
//     page = 1,
//     limit = 10,
//     sort = "newest",
//     search = "" }) => {
//     console.log("admin", isAdmin);

//     const skip = (page - 1) * limit;
//     const sortOrder = sort === "oldest" ? 1 : -1;

//     const query = {};

//     if (userId) {
//         query["RequestedBy"] = userId;
//     }

//     if (salonId) {
//         query["Salon.id"] = salonId;
//     }


//     const total = await Appointment.countDocuments(query);

//     const appointments = await Appointment.find(query)
//         .select({
//             "Salon.name": 1,
//             "Salon.image": 1,
//             status: 1,
//             services: 1,
//             appointmentDate: 1,
//             startTime: 1,
//             RequestedBy: 1,
//             RequestedFrom: 1,
//             sourceType: 1
//         })
//         .populate("RequestedBy", "email")
//         .populate("RequestedFrom", "email")
//         .sort({ updatedAt: sortOrder })
//         .skip(skip)
//         .limit(limit)
//         .lean()

//     const items = appointments.map(a => ({
//         salonName: a.Salon?.name || "",
//         salonImage: a.Salon?.image || "",
//         status: a.status,
//         requestedByEmail: a.RequestedBy?.email || "",
//         requestedFromEmail: a.RequestedFrom?.email || "",
//         services: a.services.map(s => s.name),
//         appointmentDate: a.appointmentDate,
//         startTime: a.startTime,
//         type: a.sourceType
//     }));

//     return {
//         items,
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//         sort
//     };
// };

const getAppointments = async ({
    userId = null,
    salonId = null,
    isAdmin = false,
    page = 1,
    limit = 10,
    sort = "newest",
    search = "",
    status = ""
}) => {
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;
    const searchTerm = (search || "").trim();

    // Build base match
    const match = {};
    if (userId) match["RequestedBy"] = new mongoose.Types.ObjectId(userId);
    if (salonId) match["Salon.id"] = new mongoose.Types.ObjectId(salonId);

    if (status && status.trim() !== "") match["status"] = status;


    const pipeline = [
        { $match: match },

        // Lookup RequestedBy
        {
            $lookup: {
                from: "users", // exact MongoDB collection name
                localField: "RequestedBy",
                foreignField: "_id",
                as: "requestedBy"
            }
        },
        { $unwind: { path: "$requestedBy", preserveNullAndEmptyArrays: true } },

        // Lookup RequestedFrom
        {
            $lookup: {
                from: "users",
                localField: "RequestedFrom",
                foreignField: "_id",
                as: "requestedFrom"
            }
        },
        { $unwind: { path: "$requestedFrom", preserveNullAndEmptyArrays: true } },

        // Create safe fields for search
        {
            // $addFields: {
            //     requestedByEmailSafe: { $ifNull: ["$requestedBy.email", ""] },
            //     requestedFromEmailSafe: { $ifNull: ["$requestedFrom.email", ""] },
            //     salonNameSafe: { $ifNull: ["$Salon.name", ""] }
            // }

            $addFields: {
                requestedByEmailSafe: { $ifNull: ["$requestedBy.email", ""] },
                requestedByName: { $ifNull: ["$requestedBy.name", ""] },
                requestedByPhone: { $ifNull: ["$requestedBy.phoneNumber", ""] },
                requestedByProfile: { $ifNull: ["$requestedBy.userProfile", ""] },

                requestedFromEmailSafe: { $ifNull: ["$requestedFrom.email", ""] },
                requestedFromName: { $ifNull: ["$requestedFrom.name", ""] },
                requestedFromPhone: { $ifNull: ["$requestedFrom.phoneNumber", ""] },
                requestedFromProfile: { $ifNull: ["$requestedFrom.userProfile", ""] },

                salonNameSafe: { $ifNull: ["$Salon.name", ""] }
            }

        }
    ];

    // Apply search
    if (searchTerm !== "") {
        const regex = new RegExp(searchTerm, "i");
        pipeline.push({
            $match: {
                $or: [
                    { salonNameSafe: regex },
                    { services: { $elemMatch: { name: regex } } },
                    { requestedByEmailSafe: regex },
                    { requestedFromEmailSafe: regex }
                ]
            }
        });
    }

    // Count total
    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Appointment.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Sort, paginate, and project final fields
    pipeline.push(
        { $sort: { updatedAt: sortOrder } },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                salonName: "$Salon.name",
                salonImage: "$Salon.image",
                status: 1,
                services: { $map: { input: "$services", as: "s", in: "$$s.name" } },
                appointmentDate: 1,
                startTime: 1,
                reschduleReason: 1,
                // requestedByEmail: "$requestedByEmailSafe",
                // requestedFromEmail: "$requestedFromEmailSafe",
                requestedBy: {
                    email: "$requestedByEmailSafe",
                    name: "$requestedByName",
                    phone: "$requestedByPhone",
                    image: "$requestedByProfile",
                },
                requestedFrom: {
                    email: "$requestedFromEmailSafe",
                    name: "$requestedFromName",
                    phone: "$requestedFromPhone",
                    image: "$requestedFromProfile",
                },
                type: "$sourceType"
            }
        }
    );

    const items = await Appointment.aggregate(pipeline);

    return {
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort,
        search
    };
};

module.exports = {
    createAppointment,
    scheduleAppointment,
    getAppointmentDetails,
    requestAppointmentReschedule,
    holdAppointment,
    declineAppointment,
    getAppointments,
    confirmAppointment,
    createAndScheduleAppointment
}
