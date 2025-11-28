const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timelineSchema = new Schema({
    event: {
        type: String,
        required: [true, "Timeline title is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    tag: {
        type: String,
        required: [true, "Tag is required"], 
        enum: ["gift-requested", "gift-accepted", "requested",  "scheduled", "reschedule-requested", "rescheduled", "accepted", "declined"]
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

module.exports = timelineSchema;
