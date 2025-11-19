const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");


const salonServiceSchema = new Schema({
    serviceName: {
        type: String,
        required: [true, "Service name is required"],
        trim: true,
    },
    serviceDuration: {
        type: Number,
        required: [true, "Service duration is required"],
        min: [0.5, "Service duration must be at least 0.5 hours"],
    },
    servicePrice: {
        type: Number,
        required: [true, "Service price is required"],
        min: [0, "Service price cannot be negative"],
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    salonId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Salon ID is required"],
        immutable: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    serviceDiscount: {
        type: Number,
        default: 0,
        min: [0, "Service discount cannot be negative"],
        max: [100, "Service discount cannot exceed 100%"],
    },
    serviceImage: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                return validator.isURL(value, { protocols: ['http', 'https'], require_protocol: false });
            },
            message: "Service image must be a valid URL",
        },
    },
}, { timestamps: true });


const SalonService = mongoose.model("SalonService", salonServiceSchema);
module.exports = SalonService;