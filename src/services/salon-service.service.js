const Service = require("../models/Service/salon-service.model");

const createSalonService = async (salonServiceData) => {
    const salonService = new Service(salonServiceData);
    await salonService.save();
    return salonService;
}

const getSalonServicesBySalonId = async (page = 1, limit = 10, salonId, sort) => {
    
    const skip = (page - 1) * limit;
    const sortOrder = sort === "oldest" ? 1 : -1;

    const total = await Service.countDocuments({ salonId });
    const services = await Service.find({ salonId })
        .sort({ updatedAt: sortOrder })
        .skip(skip)
        .limit(limit);

    return {
        items: services,
        total,
        page,
        pages: Math.ceil(total / limit),
        sort: sort
    };
}

const updateSalonService = async (serviceId, updateData) => {
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No data provided for update');
    }

    const isValidService = await Service.findById(serviceId);
    if (!isValidService) {
        throw new Error('Salon service not found');
    }
    const service = await Service.findByIdAndUpdate(serviceId, updateData, { new: true });
    return service;
}

const deleteSalonService = async (serviceId) => {

    const isValidService = await Service.findById(serviceId);
    if (!isValidService) {
        throw new Error('Salon service not found');
    }
    await Service.findByIdAndDelete(serviceId);
    return {}
}

module.exports = {
    createSalonService,
    getSalonServicesBySalonId,
    updateSalonService,
    deleteSalonService,
};