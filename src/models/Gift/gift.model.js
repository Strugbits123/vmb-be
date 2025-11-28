const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const Timeline = require("../Appointment/timeline.model");


const giftSchema = new Schema({
    requesterId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Requester ID is required"],
        immutable: true,
    },
    receiverEmail: {
        type: String,
        required: [true, "Receiver email is required"],
        trim: true,
        lowercase: true,
        immutable: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: "Receiver email must be a valid email address",
        },
    },
    services: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "SalonService",
            }
        ],
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length > 0;
            },
            message: "At least one service must be selected",
        }
    },
    salonId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Salon ID is required"],
    },
    message: {
        type: String,
        trim: true,
        maxlength: [500, "Message cannot exceed 500 characters"],
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    payment: {
        type: Object,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
    },
    timeline: {
        type: [Timeline],
        default: []
    },
    appointment: {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
        default: null
    },
}, { timestamps: true });

const Gift = mongoose.model("Gift", giftSchema);
module.exports = Gift;