const mongoose = require("mongoose");
const { logger } = require('../utils/logger');


const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB connected with ${connection.host}`);
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`, error);
        process.exit(1);
    }
}

module.exports = connectDB;