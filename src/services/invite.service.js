// const sendMail = require("../utils/sendMail");
const moment = require("moment");
const Invite = require("../models/Invite/invite.model");
const Service = require('../models/Service/salon-service.model');
const User = require('../models/User/user.model');


const createInvite = async (obj) => {
    const { salonId, services } = obj;

    if (!services) {
        throw new Error("Please select a valid service");
    }

    const serviceRecord = await Service.findById(services);
    if (!serviceRecord) {
        throw new Error(`Service with ID ${services} does not exist`);
    }
    if (serviceRecord.salonId.toString() !== salonId) {
        throw new Error(`Service ${services} does not belong to this salon`);
    }

    obj.timeline = [{
        event: "Invitation Created",
        description: "Invitation created successfully",
        tag: "invited"
    }];
    const invite = new Invite(obj);
    await invite.save();
    return invite;
}

const getInviteDetails = async (id) => {

    const invite = await Invite.findById(id)
    if (!invite) {
        throw new Error("Not a valid invite")
    }

    return invite
}

const acceptInvite = async (id, data) => {

    const invite = await Invite.findById(id)
    if (!invite) {
        throw new Error("Not a valid invite")
    }

    invite.status = 'claimed';
    invite.isPaid = true;
    invite.payment = data.payment;
    invite.appointment = data.appointment
    invite.timeline.push({
        event: "Invitation Accepted",
        description: "Invitation was accepted and paid successfully.",
        tag: "accepted"
    });

    await invite.save();
    return invite;

}

const markInviteAsUnClaimed = async () => {

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await Invite.updateMany(
        {
            status: "pending",
            createdAt: { $lt: sevenDaysAgo }
        },
        {
            $set: { status: "unclaimed" }
        }
    );

    return result;
}

const getFullInviteDetails = async (id) => {

    const invite = await Invite.findById(id)
        .select({
            discountPercentage: 1,
            status: 1,
            message: 1,
            createdAt: 1,
            inviteeEmail: 1,
            salonId: 1,
            services: 1,
        })
        .populate({
            path: "salonId",
            select: "email salonName profilePic phoneNumber description",
        })
        .populate({
            path: "services",
            select: "serviceName servicePrice serviceDuration",
        })
        .lean()

    if (!invite) {
        throw new Error("Not a valid Invite")
    }

    const user = await User.findOne({ email: invite.inviteeEmail })
        .select("_id name email phone")
        .lean();

    if (!user) {
        throw new Error("Unable to fetch user details")
    }

    const salon = invite.salonId;
    const created = moment(invite.createdAt);
    const expiresOn = created.clone().add(7, "days");


    return {
        salonName: salon?.salonName || "",
        salonDesc: salon?.description || "",
        salonEmail: salon?.email || "",
        salonPhone: salon?.phoneNumber || "",
        status: invite.status,
        user: {
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phoneNumber,
        },
        message: invite.message || "",
        service: {
            serviceName: invite.services?.serviceName || "",
            servicePrice: invite.services?.servicePrice || "",
            serviceDuration: invite.services?.serviceDuration || "",
            discountPercentage: invite.discountPercentage,
        },
        createdAt: created.format("YYYY-MM-DD"),
        expiresOn: expiresOn.format("YYYY-MM-DD"),
    };
}

// const getInvites = async ({
//     userId = null,
//     salonId = null,
//     isAdmin = false,
//     page = 1,
//     limit = 10,
//     sort = "newest"
// }) => {

//     const skip = (page - 1) * limit;
//     const sortOrder = sort === "oldest" ? 1 : -1;

//     const query = {};

//     if (userId) {
//         query["inviteeEmail"] = userId;
//     }

//     if (salonId) {
//         query["salonId"] = salonId;
//     }

//     const total = await Invite.countDocuments(query);

//     const invites = await Invite.find(query)
//         .select({
//             discountPercentage: 1,
//             status: 1,
//             message: 1,
//             createdAt: 1,
//             inviteeEmail: 1,
//             salonId: 1,
//             services: 1,
//         })
//         .populate({
//             path: "salonId",
//             select: "email salonName",
//         })
//         .populate({
//             path: "services",
//             select: "serviceName",
//         })
//         .sort({ updatedAt: sortOrder })
//         .skip(skip)
//         .limit(limit)
//         .lean()

//     const items = invites.map((a) => {
//         const salon = a.salonId;
//         const created = moment(a.createdAt);
//         const expiresOn = created.clone().add(7, "days");


//         return {
//             _id: a._id,
//             salonName: salon?.salonName || "",
//             salonEmail: salon?.email || "",
//             status: a.status,
//             discountPercentage: a.discountPercentage,
//             inviteeEmail: a.inviteeEmail,
//             message: a.message || "",
//             services: a.services?.serviceName || "",
//             createdAt: created.format("YYYY-MM-DD"),
//             expiresOn: expiresOn.format("YYYY-MM-DD"),
//         };
//     });

//     return {
//         items,
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//         sort,
//     };
// };

const getInvites = async ({
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
    const statusFilter = (status || "").trim();

    const query = {};

    if (userId) query["inviteeEmail"] = userId;
    if (salonId) query["salonId"] = salonId;

    if (statusFilter !== "") {
        query.status = statusFilter;
    }

    if (searchTerm !== "") {
        const regex = new RegExp(searchTerm, "i");
        
        const [matchingServices, matchingSalons] = await Promise.all([
            Service.find({ serviceName: regex }).select("_id").lean(),
            User.find({ 
                $or: [
                    { salonName: regex },
                    { email: regex }
                ]
            }).select("_id").lean()
        ]);

        const serviceIds = matchingServices.map(s => s._id);
        const salonIds = matchingSalons.map(s => s._id);

        query.$or = [
            { inviteeEmail: regex },
            ...(serviceIds.length > 0 ? [{ services: { $in: serviceIds } }] : []),
            ...(salonIds.length > 0 ? [{ salonId: { $in: salonIds } }] : [])
        ];

        if (query.$or.length === 0) {
            return {
                items: [],
                total: 0,
                page,
                pages: 0,
                sort,
                search,
                status: statusFilter || 'all'
            };
        }
    }

    const [total, invites] = await Promise.all([
        Invite.countDocuments(query),
        Invite.find(query)
            .select({
                discountPercentage: 1,
                status: 1,
                message: 1,
                createdAt: 1,
                inviteeEmail: 1,
                salonId: 1,
                services: 1,
            })
            .populate({
                path: "salonId",
                select: "email salonName",
            })
            .populate({
                path: "services",
                select: "serviceName",
            })
            .sort({ updatedAt: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

    const items = invites.map((a) => {
        const salon = a.salonId;
        const created = moment(a.createdAt);
        const expiresOn = created.clone().add(7, "days");

        return {
            _id: a._id,
            salonName: salon?.salonName || "",
            salonEmail: salon?.email || "",
            status: a.status,
            discountPercentage: a.discountPercentage,
            inviteeEmail: a.inviteeEmail,
            message: a.message || "",
            services: a.services.serviceName || "", 
            createdAt: created.format("YYYY-MM-DD"),
            expiresOn: expiresOn.format("YYYY-MM-DD"),
        };
    });

    return {
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort,
        search,
        status: statusFilter || 'all' 
    };
};

module.exports = {
    createInvite,
    markInviteAsUnClaimed,
    getInviteDetails,
    acceptInvite,
    getInvites,
    getFullInviteDetails
}