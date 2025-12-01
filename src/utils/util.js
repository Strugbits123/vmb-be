const cron = require("node-cron");
const moment = require("moment");
const { cleanOldLogs, logger } = require("./logger");

const setAuthCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    res.cookie("jwt", token, cookieOptions);
}

const setupSchedulers = () => {

    // Schedule log cleanup every day
    cron.schedule('1 2 * * *', () => {
        logger.info('Running scheduled log cleanup');
        cleanOldLogs();
    });
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

function validateSalonOperatingHours(appointmentDate, startTime, salon) {
    if (!appointmentDate || !startTime) {
        throw new Error("Appointment date and start time are required");
    }

    const { workingDays, startTime: salonStart, endTime: salonEnd } = salon;

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

module.exports = validateSalonOperatingHours;



module.exports = { setAuthCookie, setupSchedulers, convertToMinutes, validateSalonOperatingHours };