const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        immutable: true
    },

    balance: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Balance cannot be negative"]
    },

    transactions: [
        {
            type: {
                type: String,
                enum: {
                    values: ["credit", "debit"],
                    message: 'Transaction type must be either "credit" or "debit"',
                },
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                min: 1,
            },
            meta: {
                type: Object,
                default: {}
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });


const wallet = mongoose.model("Wallet", walletSchema);
module.exports = wallet;