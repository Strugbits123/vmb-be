const moment = require("moment");
const axios = require("axios")

const setAuthCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    res.cookie("jwt", token, cookieOptions);
}

const convertToMinutes = (timeStr) => {
    const [_, hh, mm, period] = timeStr.match(/(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)/i);

    let hours = parseInt(hh, 10);
    const minutes = parseInt(mm, 10);

    if (period.toUpperCase() === "PM" && hours !== 12) {
        hours += 12;
    }

    if (period.toUpperCase() === "AM" && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
}

const validateSalonOperatingHours = (appointmentDate, startTime, salon) => {
    if (!appointmentDate || !startTime) {
        throw new Error("Appointment date and start time are required");
    }

    const { workingDays, startTime: salonStart, endTime: salonEnd } = salon;

    const today = moment().startOf("day");
    const apptDate = moment(appointmentDate).startOf("day");

    if (!apptDate.isValid()) {
        throw new Error("Invalid appointment date");
    }

    if (apptDate.isBefore(today)) {
        throw new Error("Appointment date cannot be in the past");
    }

    if (!workingDays || !salonStart || !salonEnd) {
        throw new Error("Salon working hours are not configured");
    }

    const dayName = moment(appointmentDate).format("dddd");
    if (!workingDays.includes(dayName)) {
        throw new Error(`Salon does not operate on ${dayName}`);
    }

    const userStart = moment(startTime, "hh:mm A");
    const salonStartTime = moment(salonStart, "hh:mm A");
    const salonEndTime = moment(salonEnd, "hh:mm A");

    if (!userStart.isValid()) {
        throw new Error("Invalid time format");
    }

    if (
        userStart.isBefore(salonStartTime) ||
        userStart.isSameOrAfter(salonEndTime)
    ) {
        throw new Error(
            `Appointment start time must be between ${salonStart} and ${salonEnd}.`
        );
    }

    return true;
}


const validateZipCode = async (zipcode) => {
    if (!zipcode) {
        return { status: false, message: "ZIP code is required" };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${apiKey}`;

    try {
        const { data } = await axios.get(url);

        if (!data.results || data.results.length === 0) {
            return { status: false, message: "Invalid ZIP code" };
        }

        const postal = data.results[0].address_components.find(c =>
            c.types.includes("postal_code")
        );

        if (!postal) {
            return { status: false, message: "Invalid ZIP code" };
        }

        const { lat, lng } = data.results[0].geometry.location;

        return { 
            status: true, 
            message: "Valid ZIP code",
            lat: lat,
            lng: lng
        };

    } catch (error) {
        console.error("ZIP validation error:", error.message);
        return { status: false, message: "Error validating ZIP code" };
    }
};


module.exports = { setAuthCookie, convertToMinutes, validateSalonOperatingHours, validateZipCode };