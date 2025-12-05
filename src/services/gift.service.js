const sendMail = require("../utils/sendMail");
const mongoose = require("mongoose");
const moment = require("moment");
const Gift = require("../models/Gift/gift.model");
const Service = require('../models/Service/salon-service.model');
const User = require('../models/User/user.model');


const createGift = async (obj) => {
    const { salonId, services } = obj;

    const salon = await User.findById(salonId)

    if (!salon) {
        throw new Error("Please provide a valid salon")
    }

    for (let item of services) {
        const serviceRecord = await Service.findById(item);
        if (!serviceRecord) {
            throw new Error(`Service with ID ${item} does not exist`);
        }
        if (serviceRecord.salonId.toString() !== salonId) {
            throw new Error(`Service ${item} does not belong to this salon`);
        }
    }

    obj.timeline = [{
        event: "Gift Request Created",
        description: "Gift request was created successfully",
        tag: "gift-requested"
    }];

    const gift = new Gift(obj);
    await gift.save();
    return gift;
}

const acceptGift = async (giftId, data) => {
    if (!data.payment || !data.payment.payId) {
        throw new Error('Payment ID is required to accept the gift');
    }
    const gift = await Gift.findById(giftId);
    if (!gift) {
        throw new Error('Gift not found');
    }

    if (gift.status === 'accepted') {
        throw new Error("Cannot accept already accepted gift")
    }
    gift.status = 'accepted';
    gift.isPaid = true;
    gift.payment = data.payment;
    gift.appointment = data.appointment
    gift.timeline.push({
        event: "Gift Accepted and Paid",
        description: "Gift request was accepted and paid successfully",
        tag: "gift-accepted"
    });
    await gift.save();
    return gift;
}

const rejectGift = async (giftId) => {
    const gift = await Gift.findById(giftId);
    if (!gift) {
        throw new Error('Gift not found');
    }

    if (gift.status === 'declined') {
        throw new Error("Cannot decline already declined gift")
    }
    gift.status = 'declined';
    gift.timeline.push({
        event: "Gift Request Rejected",
        description: "Gift request was rejected",
        tag: "declined"
    })
    await gift.save();
    return gift;
}

const getGiftDetails = async (giftId) => {
    const gift = await Gift.findById(giftId)
        .populate({
            path: "services",
            select: "serviceName servicePrice serviceDuration"
        })
        .populate({
            path: "requesterId",
            select: "name email phoneNumber userProfile"
        });

    if (!gift) {
        throw new Error("Gift not found");
    }

    const receiver = await User.findOne(
        { email: gift.receiverEmail },
        "name email phoneNumber userProfile"
    );

    const normalizeUser = (user) => ({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        userProfile: user?.userProfile || "",
    });

    const requester = normalizeUser(gift.requesterId || {});
    const receiverNormalized = normalizeUser(receiver || {});

    const services = (gift.services || []).map(s => ({
        serviceName: s?.serviceName || "",
        servicePrice: s?.servicePrice || "",
        serviceDuration: s?.serviceDuration || ""
    }));

    return {
        ...gift.toObject(),
        services,
        requester,
        receiver: receiverNormalized
    };
};



// const fetchGifts = async ({ requesterId, receiverEmail, page = 1, limit = 10, sort = "newest" }) => {
//     if (!["newest", "oldest"].includes(sort)) {
//         throw new Error("Invalid sort parameter: must be 'newest' or 'oldest'");
//     }

//     const skip = (page - 1) * limit;
//     const sortOrder = sort === "oldest" ? 1 : -1;

//     const filter = {};
//     if (requesterId) filter.requesterId = requesterId;
//     if (receiverEmail) filter.receiverEmail = receiverEmail;

//     const total = await Gift.countDocuments(filter);
//     const items = await Gift.find(filter)
//         .populate({
//             path: "services",
//             select: "serviceName servicePrice serviceDuration",
//         })
//         .populate({
//             path: "salonId",
//             select: "salonName profilePic email description ",
//         })
//         .populate({
//             path: "requesterId",
//             select: "name email",
//         })
//         .sort({ createdAt: sortOrder })
//         .skip(skip)
//         .limit(limit)
//         .lean();

//     return {
//         items,
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//         sort,
//     };
// };


const fetchGifts = async ({ requesterId, receiverEmail, page = 1, limit = 10, sort = "newest", search = "" }) => {
    if (!["newest", "oldest"].includes(sort)) {
        throw new Error("Invalid sort parameter: must be 'newest' or 'oldest'");
    }

    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;

    const filter = {};
    if (requesterId) filter.requesterId = new mongoose.Types.ObjectId(requesterId);
    if (receiverEmail) filter.receiverEmail = receiverEmail;

    // If search is provided, find matching IDs first
    if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");

        const [matchingServices, matchingSalons, matchingRequesters] = await Promise.all([
            Service.find({ serviceName: searchRegex }).select("_id").lean(),
            User.find({ $or: [{ salonName: searchRegex }, { email: searchRegex }] }).select("_id").lean(),
            User.find({ email: searchRegex }).select("_id").lean()
        ]);

        const serviceIds = matchingServices.map(s => s._id);
        const salonIds = matchingSalons.map(s => s._id);
        const requesterIds = matchingRequesters.map(r => r._id);

        filter.$or = [
            { receiverEmail: searchRegex },
            ...(serviceIds.length > 0 ? [{ services: { $in: serviceIds } }] : []),
            ...(salonIds.length > 0 ? [{ salonId: { $in: salonIds } }] : []),
            ...(requesterIds.length > 0 ? [{ requesterId: { $in: requesterIds } }] : [])
        ];

        if (filter.$or.length === 0) {
            return {
                items: [],
                total: 0,
                page,
                pages: 0,
                sort,
                search
            };
        }
    }

    const [total, items] = await Promise.all([
        Gift.countDocuments(filter),
        Gift.find(filter)
            .populate("services", "serviceName servicePrice serviceDuration")
            .populate("salonId", "salonName profilePic email description")
            .populate("requesterId", "name email")
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

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
    createGift,
    acceptGift,
    rejectGift,
    getGiftDetails,
    fetchGifts
};