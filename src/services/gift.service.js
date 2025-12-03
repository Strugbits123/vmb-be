const sendMail = require("../utils/sendMail");
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
        tag: "created"
    })
    await gift.save();
    return gift;
}

const getGiftDetails = async (giftId) => {
    const gift = await Gift.findById(giftId).populate('services');
    if (!gift) {
        throw new Error('Gift not found');
    }
    return gift;
}

const fetchGifts = async ({ requesterId, receiverEmail, page = 1, limit = 10, sort = "newest" }) => {
    if (!["newest", "oldest"].includes(sort)) {
        throw new Error("Invalid sort parameter: must be 'newest' or 'oldest'");
    }

    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;

    const filter = {};
    if (requesterId) filter.requesterId = requesterId;
    if (receiverEmail) filter.receiverEmail = receiverEmail;

    const total = await Gift.countDocuments(filter);
    const items = await Gift.find(filter)
        .populate({
            path: "services",
            select: "serviceName servicePrice",
        })
        .populate({
            path: "salonId",
            select: "salonName profilePic email",
        })
        .populate({
            path: "requesterId",
            select: "name email",
        })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort,
    };
};

module.exports = {
    createGift,
    acceptGift,
    rejectGift,
    getGiftDetails,
    fetchGifts
};