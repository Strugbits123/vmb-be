const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Customer ID is required"],
    },
    salonId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Salon ID is required"],
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
    bookingDate: {
        type: Date,
        required: [true, "Booking date is required"],
    },
    bookingTime: {
        type: String,
        required: [true, "Booking time is required"],
        validate: {
            validator: function (value) {
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
            },
            message: "Booking time must be in HH:MM format",
        },
    },
    status: {
        type: String,
        enum: ["pending", "reschedule", "hold", "confirmed", "declined"],
        default: "pending",
    },
    amountPaid: {
        type: Number,
        required: [true, "Amount paid is required"],
        min: [0, "Amount paid cannot be negative"],
    },
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
