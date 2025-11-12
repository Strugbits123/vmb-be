// const logger = require("../functions/logger");
const ErrorHandler = (message, statusCode, req, res) => {
    //   logger.error({
    //     method: req.method,
    //     url: req.url,
    //     date: new Date(),
    //     message: message,
    //   });
    return res.status(statusCode).json({
        success: false,
        message: message,
    });
};

const getValidationErrorMessage = (error) => {
    if (error.name === "ValidationError") {
        const firstErrorKey = Object.keys(error.errors)[0];
        return error.errors[firstErrorKey].message;
    }

    return error.message || "An unknown error occurred";
}


module.exports = {
    ErrorHandler,
    getValidationErrorMessage
};
