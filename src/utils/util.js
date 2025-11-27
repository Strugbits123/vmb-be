const cron = require("node-cron");
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



module.exports = { setAuthCookie, setupSchedulers, convertToMinutes };