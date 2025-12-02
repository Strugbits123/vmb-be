// const sendMail = require("../utils/sendMail");
const Invite = require("../models/Invite/invite.model");
const Service = require('../models/Service/salon-service.model');


const createInvite = async (obj) => {
    const { salonId, service } = obj;

    if (!service) {
        throw new Error("Please select a valid service");
    }

    const serviceRecord = await Service.findById(service);
    if (!serviceRecord) {
        throw new Error(`Service with ID ${service} does not exist`);
    }
    if (serviceRecord.salonId.toString() !== salonId) {
        throw new Error(`Service ${service} does not belong to this salon`);
    }

    obj.timeline.push({
        event: "Invitation Created",
        description: "",
        tag: "scheduled"
    });
    const invite = new Invite(obj);
    await invite.save();
    return invite;
}

module.exports = {
    createInvite
}