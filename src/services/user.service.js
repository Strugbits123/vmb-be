const User = require("../models/User/user.model");
const Salon = require("../models/User/salon-owner.model");
const SalonService = require("../models/Service/salon-service.model")


const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
}

const updateUser = async (userId, updateData) => {
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No data provided for update');
    }

    const isValidUser = await getUserById(userId);
    if (!isValidUser) {
        throw new Error('User not found');
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) throw new Error('User not found or update failed');
    return user;
}

const updateSalon = async (userId, updateData) => {
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No data provided for update');
    }

    const isValidUser = await getUserById(userId);
    if (!isValidUser) {
        throw new Error('User not found');
    }

    const salon = await Salon.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');
    if (!salon) throw new Error('User not found or update failed');
    return salon;
}

const getAllSalons = async (page = 1, limit = 10, sort = "newest") => {
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;
    const filter = { role: "salon-owner", status: "approved" };
    const total = await User.countDocuments(filter);
    const salons = await User.find(filter)
        .select(
            "profilePic salonName description startTime endTime salonPhotos workingDays salonZipcode salonAddress phoneNumber"
        )
        .sort({ updatedAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();
    const salonIds = salons.map((s) => s._id);
    const allServices = await SalonService.find({
        salonId: { $in: salonIds },
    }).lean();
    const servicesBySalon = {};
    allServices.forEach((service) => {
        if (!servicesBySalon[service.salonId]) {
            servicesBySalon[service.salonId] = [];
        }
        servicesBySalon[service.salonId].push(service);
    });
    const salonsWithExtras = salons.map((salon) => ({
        ...salon,
        distance: "5 miles away",
        services: servicesBySalon[salon._id] || [],
    }));
    return {
        items: salonsWithExtras,
        total: total,
        page,
        pages: Math.ceil(total / limit),
        sort,
    };
};


module.exports = {
    getUserById,
    updateUser,
    updateSalon,
    getAllSalons
};