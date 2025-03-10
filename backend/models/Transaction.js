const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true }, // Wallet reference
    type: { type: String, enum: ["credit", "debit"], required: true }, // Transaction type
    amount: { type: Number, required: true, min: 0 }, // Current transaction amount
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Order reference (optional)
    description: { type: String, default: "" }, // Optional description for tracking
    paid: { type: Boolean, default: false},
    // History of past transactions before each update**
    transactionHistory: [{
        amount: { type: Number, required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        description: { type: String },
        paid: { type: Boolean},
        timestamp: { type: Date, default: Date.now }
    }],

}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
