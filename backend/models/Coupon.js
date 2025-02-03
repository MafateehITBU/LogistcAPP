const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true }, // % or fixed amount
    discountValue: { type: Number, required: true }, // The discount amount
    minPointsRequired: { type: Number, default: 0 }, // Points required to redeem this coupon
    maxUsage: { type: Number, default: 1 }, // Max times a user can use it
    usedCount: { type: Number, default: 0 }, // Tracks how many times it's been used
    expiryDate: { type: Date, required: true }, // Expiration date
    isActive: { type: Boolean, default: true }, // Coupon status (active/inactive)
    usersRedeemed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
},{timestamps: true});

module.exports = mongoose.model("Coupon", couponSchema);
