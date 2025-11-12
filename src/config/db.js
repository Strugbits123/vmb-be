const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ 
    path: "./src/config/.env" 
});

const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected with ${connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;