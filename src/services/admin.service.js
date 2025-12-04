const Salon = require("../models/User/salon-owner.model");
const Invite = require("../models/Invite/invite.model");
const Gift = require("../models/Gift/gift.model");
const Appointment = require("../models/Appointment/appointment.model");
const sendMail = require("../utils/sendMail");
const moment = require("moment")


const getPendingSalons = async (page = 1, limit = 10, sort = "newest") => {
    if (sort !== 'newest' && sort !== 'oldest') {
        throw new Error('Invalid sort parameter');
    }
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;

    const total = await Salon.countDocuments({ status: 'pending' });
    const salons = await Salon.find({ status: 'pending' })
        .sort({ createdAt: sortOrder })
        .select('-password')
        .skip(skip)
        .limit(limit);

    return {
        items: salons,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort: sort
    };
};

const getAllSalons = async (page = 1, limit = 10, sort = "newest", search = "", status = "") => {
    if (sort !== 'newest' && sort !== 'oldest') {
        throw new Error('Invalid sort parameter');
    }
    
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;

    const query = { role: 'salon-owner' }; 

    // Add status filter if provided
    if (status && status.trim() !== '') {
        query.status = status.trim();
    }

    // Add search conditions if search term exists
    if (search && search.trim() !== '') {
        query.$or = [
            { salonName: { $regex: search.trim(), $options: 'i' } },
            { email: { $regex: search.trim(), $options: 'i' } }
        ];
    }

    const total = await Salon.countDocuments(query);
    const salons = await Salon.find(query)
        .sort({ createdAt: sortOrder })
        .select('-password')
        .skip(skip)
        .limit(limit);

    return {
        items: salons,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort: sort,
        search: search,
        status: status || 'all'
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

const getWeeklyStats = async () => {
    const startOfWeekDate = moment().startOf("week").toDate();
    const endOfWeekDate = moment().endOf("week").toDate();

    const startOfWeekStr = moment().startOf("week").format("YYYY-MM-DD");
    const endOfWeekStr = moment().endOf("week").format("YYYY-MM-DD");

    const [appointmentsCount, giftsCount, invitesCount] = await Promise.all([

        Appointment.countDocuments({
            appointmentDate: {
                $gte: startOfWeekStr,
                $lte: endOfWeekStr
            }
        }),

        Gift.countDocuments({
            createdAt: {
                $gte: startOfWeekDate,
                $lte: endOfWeekDate
            }
        }),

        Invite.countDocuments({
            createdAt: {
                $gte: startOfWeekDate,
                $lte: endOfWeekDate
            }
        })

    ]);

    return {
        week: {
            start: startOfWeekStr,
            end: endOfWeekStr,
        },
        appointmentsCount,
        giftsCount,
        invitesCount
    };
}

module.exports = {
    getPendingSalons,
    approveSalon,
    rejectSalon,
    holdSalon,
    getWeeklyStats,
    getAllSalons
};