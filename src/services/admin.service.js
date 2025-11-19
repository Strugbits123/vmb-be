const Salon = require("../models/User/salon-owner.model");
const sendMail = require("../utils/sendMail");


const getPendingSalons = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const total = await Salon.countDocuments({ status: 'pending' });
    const salons = await Salon.find({ status: 'pending' })
        .select('-password')
        .skip(skip)
        .limit(limit);

    return {
        items: salons,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};



const approveSalon = async (salonId) => {
    const salon = await Salon.findById(salonId);

    if (!salon) {
        throw new Error('Salon not found');
    }

    if (salon.role !== 'salon-owner') {
        throw new Error('Not a valid salon owner');
    }

    if (salon.status === 'approved') {
        throw new Error('Salon is already approved');
    }

    const updatedSalon = await Salon.findByIdAndUpdate(
        salonId,
        { status: 'approved', holdReason: '' },
        { new: true }
    ).select('-password');

    await sendMail({
        to: updatedSalon.email,
        templateId: process.env.SENDGRID_SALON_APPROVAL_TEMPLATE_ID,
        templataData: {
            base_url: process.env.FRONTEND_URL,
        },
    });

    return updatedSalon;
};


const rejectSalon = async (salonId) => {
    const salon = await Salon.findById(salonId);

    if (!salon) {
        throw new Error('Salon not found');
    }

    if (salon.role !== 'salon-owner') {
        throw new Error('Not a valid salon owner');
    }

    if (salon.status === 'rejected') {
        throw new Error('Salon is already rejected');
    }

    const updatedSalon = await Salon.findByIdAndUpdate(
        salonId,
        { status: 'rejected' },
        { new: true }
    ).select('-password');

    await sendMail({
        to: updatedSalon.email,
        templateId: process.env.SENDGRID_SALON_REJECT_TEMPLATE_ID,
        templataData: {
            base_url: process.env.FRONTEND_URL,
        },
    });

    return updatedSalon;
}

const holdSalon = async (salonId, reason) => {
    if (!reason || reason.trim() === '') {
        throw new Error('Hold reason is required');
    }
    const salon = await Salon.findById(salonId);


    if (!salon) {
        throw new Error('Salon not found');
    }

    if (salon.role !== 'salon-owner') {
        throw new Error('Not a valid salon owner');
    }

    const updatedSalon = await Salon.findByIdAndUpdate(
        salonId,
        { status: 'hold', holdReason: reason },
        { new: true }
    ).select('-password');

    await sendMail({
        to: updatedSalon.email,
        templateId: process.env.SENDGRID_SALON_HOLD_TEMPLATE_ID,
        templataData: {
            base_url: process.env.FRONTEND_URL,
            hold_reason: reason
        },
    });
    return updatedSalon;
}

module.exports = {
    getPendingSalons,
    approveSalon,
    rejectSalon,
    holdSalon
};