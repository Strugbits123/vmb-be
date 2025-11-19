const { logger } = require('../utils/logger');

const ErrorHandler = (message, statusCode, req, res) => {    

    logger.error(
        {
            message: message,
            statusCode: statusCode,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userId: req.user?.id || 'anonymous'
        },
        `Error Response: ${message}`
    );

    return res.status(statusCode).json({
        success: false,
        message: message,
    });
};

const SuccessHandler = (message, data, statusCode, res, req) => {
    logger.info(
        {
            message: message,
            statusCode: statusCode,
            method: req?.method,
            url: req?.originalUrl,
            ip: req?.ip,
            userId: req?.user?.id || 'anonymous'
        },
        `Success Response: ${message}`
    );

    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
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
    SuccessHandler,
    getValidationErrorMessage
};
