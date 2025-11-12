const SuccessHandler = (message, data, statusCode, res) => {
    console.log("res", res);
    
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
    });
};

module.exports = SuccessHandler;