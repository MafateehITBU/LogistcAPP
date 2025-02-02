const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number, required: true },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reward", rewardSchema);
