const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const Timeline = require("../Appointment/timeline.model");

const inviteSchema = new Schema({
    salonId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Salon ID is required"],
        immutable: true,
    },
    inviteeEmail: {
        type: String,
        required: [true, "Invitee email is required"],
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            }, message: "Invitee email must be a valid email address",
        },
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: "SalonService",
        required: [true, "Service ID is required"]
    },
    firstName: {
        type: String,
        required: [true, "first name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "last name is required"],
        trim: true,
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
    paymentId: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "claimed", "unclaimed"],
        default: "pending",
    },
    discountPercentage: {
        type: Number,
        min: [0, "Discount percentage cannot be less than 0"],
        max: [99, "Discount percentage cannot be more than 99"],
        required: [true, "Discount percentage is required"],
    },
    timeline: {
        type: [Timeline],
        default: []
    },
}, { timestamps: true });

const Invite = mongoose.model("Invite", inviteSchema);
module.exports = Invite;