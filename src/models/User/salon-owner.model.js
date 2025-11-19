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
        trim: true,
    },
    endTime: {
        type: String,
        required: [true, "End time is required"],
        trim: true,
    },
    workingDays: {
        type: [
            {
                type: String,
                enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
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