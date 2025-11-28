const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user.model");
const validator = require("validator");



const salonOwnerSchema = new Schema({
    salonName: {
        type: String,
        required: [true, "Salon name is required"],
        trim: true,
    },
    salonAddress: {
        type: String,
        required: [true, "Salon address is required"],
        trim: true,
    },
    salonZipcode: {
        type: String,
        required: [true, "Salon zipcode is required"],
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        validate: {
            validator: (value) => validator.isMobilePhone(value, 'any'),
            message: "Please provide a valid phone number",
        }
    },
    startTime: {
        type: String,
        required: [true, "Start time is required"],
        validate: {
            validator: function (value) {
                if (!value) return true;
                return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(value);
            },
            message: props => `${props.value} is not a valid time format (e.g., 09:30 PM)`
        }
    },
    endTime: {
        type: String,
        required: [true, "End time is required"],
        validate: {
            validator: function (value) {
                if (!value) return true;
                return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(value);
            },
            message: props => `${props.value} is not a valid time format (e.g., 09:30 PM)`
        }
    },
    workingDays: {
        type: [
            {
                type: String,
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            },
        ],
        required: [true, "Working days are required"],
        validate: {
            validator: (days) => days.length > 0,
            message: "At least one working day must be specified",
        },
    },
    licenseDocument: {
        type: String,
        required: [true, "License document is required"],
        trim: true,
        validate: {
            validator: function (value) {
                return validator.isURL(value, { protocols: ['http', 'https'], require_protocol: false });
            },
            message: "License document must be a valid URL",
        },
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    profilePic: {
        type: String,
        trim: true
    },
    holdReason: {
        type: String,
        trim: true,
        default: ""
    },
    salonPhotos: {
        type: [String],
        default: []
    }

})

const SalonOwner = User.discriminator("salon-owner", salonOwnerSchema);
module.exports = SalonOwner;



// module.exports = User.discriminator('salon-owner', salonOwnerSchema);