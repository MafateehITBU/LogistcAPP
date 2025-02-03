const Reward = require("../models/Reward");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const crypto = require("crypto");

// Generate a unique coupon code
const generateUniqueCode = async () => {
    let unique = false;
    let couponCode = "";

    while (!unique) {
        couponCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        const existingCoupon = await Coupon.findOne({ code: couponCode });
        if (!existingCoupon) unique = true;
    }

    return couponCode;
};

// Add a new reward (creates a reward and auto-generates a coupon)
exports.addReward = async (req, res) => {
    try {
        const { name, description, pointsRequired, discountType, discountValue, expiryDate } = req.body;

        if (!["percentage", "fixed"].includes(discountType)) {
            return res.status(400).json({ message: "Invalid discount type" });
        }

        // Generate a unique coupon code
        const code = await generateUniqueCode();

        // Create the coupon first
        const newCoupon = new Coupon({
            code,
            discountType,
            discountValue,
            minPointsRequired: pointsRequired,
            maxUsage: 1,
            expiryDate
        });

        await newCoupon.save();

        // Create the reward linked to the coupon
        const newReward = new Reward({
            name,
            description,
            pointsRequired,
            coupon: newCoupon._id
        });

        await newReward.save();

        res.status(201).json({ message: "Reward and coupon created successfully", reward: newReward, coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: "Error adding reward", error });
    }
};

// Get all rewards
exports.getAllRewards = async (req, res) => {
    try {
        const rewards = await Reward.find().populate("coupon");
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rewards", error });
    }
};

// Get a single reward by ID
exports.getRewardById = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id).populate("coupon");
        if (!reward) return res.status(404).json({ message: "Reward not found" });
        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reward", error });
    }
};

// Update a reward (Does NOT change the linked coupon)
exports.updateReward = async (req, res) => {
    try {
        const { name, description, pointsRequired } = req.body;

        const updatedReward = await Reward.findByIdAndUpdate(
            req.params.id,
            { name, description, pointsRequired },
            { new: true, runValidators: true }
        );

        if (!updatedReward) return res.status(404).json({ message: "Reward not found" });

        res.status(200).json({ message: "Reward updated successfully", reward: updatedReward });
    } catch (error) {
        res.status(500).json({ message: "Error updating reward", error });
    }
};

// Delete a reward (also deletes its linked coupon)
exports.deleteReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);
        if (!reward) return res.status(404).json({ message: "Reward not found" });

        await Coupon.findByIdAndDelete(reward.coupon); // Delete the linked coupon
        await reward.deleteOne(); // Delete the reward

        res.status(200).json({ message: "Reward and linked coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting reward", error });
    }
};

// Redeem a reward (user gets the linked coupon)
exports.redeemReward = async (req, res) => {
    try {
        const userId = req.user._id;
        const reward = await Reward.findById(req.params.id).populate("coupon");
        const user = await User.findById(userId);

        if (!reward) return res.status(404).json({ message: "Reward not found" });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if the user has enough points
        if (user.points < reward.pointsRequired) {
            return res.status(400).json({ message: "Not enough points to redeem this reward" });
        }

        // Count how many times the user has redeemed the reward by checking the coupon's usersRedeemed array
        const userRedemptionCount = reward.coupon.usersRedeemed.filter(id => id.toString() === userId.toString()).length;

        // Check if the user has reached the maxUsage for the specific coupon
        if (userRedemptionCount >= reward.coupon.maxUsage) {
            return res.status(400).json({ message: "You have already redeemed this reward the maximum number of times" });
        }

        // Check if today's date is less than the expiry date
        const today = new Date();
        const expiryDate = new Date(coupon.expiryDate);

        if (today > expiryDate) {
            coupon.isActive = false;
            return res.status(400).json({ message: "The Coupon has expired"});
        }

        // Deduct points from user
        user.points -= reward.pointsRequired;

        // Mark coupon as redeemed by this user
        reward.coupon.usersRedeemed.push(userId);
        reward.coupon.usedCount += 1;
        await reward.coupon.save();
        await user.save();

        res.status(200).json({ message: "Reward redeemed successfully", coupon: reward.coupon });
    } catch (error) {
        res.status(500).json({ message: "Error redeeming reward", error });
    }
};
