const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const Timeline = require("./timeline.model");


const appointmentSchema = new Schema({
    RequestedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Requester ID is required"],
        immutable: true,
    },
    RequestedFrom: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Requested from is required"],
        immutable: true,
    },
    Salon: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Salon',
            required: [true, "Salon Id is required"]
        },
        name: {
            type: String,
            required: [true, "Salon name is required"]
        },
        description: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        }
    },
    services: {
        type: [
            {
                serviceId: {
                    type: Schema.Types.ObjectId,
                    ref: "SalonService",
                    required: true
                },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                duration: { type: Number, required: true }
            }
        ],
        validate: {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length > 0;
            },
            message: "At least one service must be selected",
        }
    },
    sourceType: {
        type: String,
        enum: ['direct', 'gift', 'invite'],
        required: [true, "source is required"]
    },
    timeline: {
        type: [Timeline],
        default: []
    },
    startTime: {
        type: String,
        default: null,
        validate: {
            validator: function (value) {
                if (!value) return true;
                return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(value);
            },
            message: props => `${props.value} is not a valid time format (e.g., 09:30 PM)`
        }
    },
    appointmentDate: {
        type: String,
        default: null,
        validate: {
            validator: function (value) {
                if (!value) return true;
                return validator.isDate(value, { format: 'YYYY-MM-DD', strictMode: true });
            },
            message: props => `${props.value} is not a valid date (expected YYYY-MM-DD)`
        }
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["pending", "scheduled", "reschedule-requested", "rescheduled", "hold", "confirmed", "declined"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true })

const Appointment = mongoose.model("Appointment", appointmentSchema)
module.exports = Appointment