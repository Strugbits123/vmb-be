const sendMail = require("../utils/sendMail");
const Gift = require("../models/Gift/gift.model");
const Service = require('../models/Service/salon-service.model');


const createGift = async (giftData) => {
    const { salonId, services } = giftData;

    for (let item of services) {
        const serviceRecord = await Service.findById(item);
        if (!serviceRecord) {
            throw new Error(`Service with ID ${item} does not exist`);
        }
        if (serviceRecord.salonId.toString() !== salonId) {
            throw new Error(`Service ${item} does not belong to this salon`);
        }
    }
    const gift = new Gift(giftData);
    await gift.save();
    return gift;
}

const acceptGift = async (giftId, data) => {
    if (!data.paymentId) {
        throw new Error('Payment ID is required to accept the gift');
    }
    const gift = await Gift.findById(giftId);
    if (!gift) {
        throw new Error('Gift not found');
    }
    gift.status = 'accepted';
    gift.isPaid = true;
    gift.paymentId = data.paymentId;
    await gift.save();
    return gift;
}

const rejectGift = async (giftId) => {
    const gift = await Gift.findById(giftId);
    if (!gift) {
        throw new Error('Gift not found');
    }
    gift.status = 'declined';
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

const getRequestedGifts = async (requesterId, page = 1, limit = 10, sort = "newest") => {
    if(sort !== 'newest' && sort !== 'oldest'){
        throw new Error("Invalid sort parameter")
    }
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;

    const total = await Gift.countDocuments({ requesterId });
    const gifts = await Gift.find({ requesterId })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit);

    return {
        items: gifts,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort: sort
    };
}

const getRecievedGifts = async (receiverEmail, page = 1, limit = 10, sort="newest") => {
    if(sort !== 'newest' && sort !== 'oldest'){
        throw new Error("sort order can only be newest or oldest")
    }
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;

    const total = await Gift.countDocuments({ receiverEmail });
    const gifts = await Gift.find({ receiverEmail })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit);

    return {
        items: gifts,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort: sort
    };
}

module.exports = {
    createGift,
    acceptGift,
    rejectGift,
    getGiftDetails,
    getRequestedGifts,
    getRecievedGifts
};