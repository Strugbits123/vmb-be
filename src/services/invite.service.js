const sendMail = require("../utils/sendMail");
const Invite = require("../models/Invite/invite.model");
const Service = require('../models/Service/salon-service.model');


const createInvite = async (inviteData) => {
    const { salonId, service } = inviteData;
    const serviceRecord = await Service.findById(service);
    if (!serviceRecord) {
        throw new Error(`Service with ID ${service} does not exist`);
    }
    if (serviceRecord.salonId.toString() !== salonId) {
        throw new Error(`Service ${service} does not belong to this salon`);
    }
    const invite = new Invite(inviteData);
    await invite.save();
    return invite;
}

const claimInvite = async (inviteId, data) => {
    if (!data.paymentId) {
        throw new Error('Payment ID is required to claim the invite');
    }
    const invite = await Invite.findById(inviteId);
    if (!invite) {
        throw new Error('Invite not found');
    }
    invite.status = 'claimed';
    invite.isPaid = true;
    invite.paymentId = data.paymentId;
    await invite.save();
    return invite;
}

const getInviteDetails = async (inviteId) => {
    const invite = await Invite.findById(inviteId).populate('service');
    if (!invite) {
        throw new Error('Invite not found');
    }
    return invite;
}

const getSentInvites = async (salonId, page = 1, limit = 10, sort = "newest") => {
    if(sort !== 'newest' && sort !== 'oldest'){
        throw new Error("Invalid sort parameter")
    }
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;
    const total = await Invite.countDocuments({ salonId });
    const invites = await Invite.find({ salonId })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('service');
     return {
        items: invites,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort: sort
    };
}

const getReceivedInvites = async (inviteeEmail, page = 1, limit = 10, sort="newest") => {
    if(sort !== 'newest' && sort !== 'oldest'){
        throw new Error("Invalid sort parameter")
    }
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;
    const total = await Invite.countDocuments({ inviteeEmail });
    const invites = await Invite.find({ inviteeEmail })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('service');
     return {
        items: invites,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort: sort
    };
}

module.exports = {
    createInvite,
    claimInvite,
    getInviteDetails,
    getSentInvites,
    getReceivedInvites
};
