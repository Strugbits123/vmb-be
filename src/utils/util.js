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


module.exports = { setAuthCookie, setupSchedulers };