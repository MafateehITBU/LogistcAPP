const mongoose = require("mongoose");
const crypto = require("crypto");

const rewardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    pointsRequired: { type: Number, required: true },
    code: { type: String, required: true, unique: true, default: () => crypto.randomBytes(4).toString("hex").toUpperCase() },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    maxUsage: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usersRedeemed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Reward", rewardSchema);