const Reward = require("../models/Reward");
const User = require("../models/User");
const crypto = require("crypto");

// Generate a unique coupon code
const generateUniqueCode = async () => {
    let unique = false;
    let couponCode = "";

    while (!unique) {
        couponCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        const existingReward = await Reward.findOne({ code: couponCode });
        if (!existingReward) unique = true;
    }

    return couponCode;
};

// Add a new reward
exports.addReward = async (req, res) => {
    try {
        const { name, description, pointsRequired, discountType, discountValue, maxUsage, expiryDate } = req.body;

        if (!["percentage", "fixed"].includes(discountType)) {
            return res.status(400).json({ message: "Invalid discount type" });
        }

        // Generate a unique coupon code
        const code = await generateUniqueCode();

        // Create the reward with coupon details
        const newReward = new Reward({
            name,
            description,
            pointsRequired,
            code,
            discountType,
            discountValue,
            expiryDate,
            maxUsage,
            usedCount: 0,
            isActive: true,
            usersRedeemed: []
        });

        await newReward.save();

        res.status(201).json({ message: "Reward created successfully", reward: newReward });
    } catch (error) {
        res.status(500).json({ message: "Error adding reward", error });
    }
};

// Get all rewards
exports.getAllRewards = async (req, res) => {
    try {
        const rewards = await Reward.find();
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rewards", error });
    }
};

// Get a single reward ID
exports.getRewardById = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);
        if (!reward) return res.status(404).json({ message: "Reward not found" });
        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reward", error });
    }
};

// Update a reward
exports.updateReward = async (req, res) => {
    try {
        const id = req.params.id;
        let updates = req.body;

        const reward = await Reward.findByIdAndUpdate(id, updates, { new: true });
        if (!reward) return res.status(404).json({ error: 'reward not found' });

        res.status(200).json({ message: "Reward updated successfully", reward });
    } catch (error) {
        res.status(500).json({ message: "Error updating reward", error });
    }
};

// Delete a reward
exports.deleteReward = async (req, res) => {
    try {
        const { id } = req.params;
        const reward = await Reward.findByIdAndDelete(id);
        if (!reward) return res.status(404).json({ error: 'reward not found' });

        res.status(200).json({ message: "Reward deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting reward", error });
    }
};

// Redeem a reward by coupon code
exports.redeemReward = async (req, res) => {
    try {
        const userId = req.user._id;
        const reward = await Reward.findOne({ code: req.body.code });
        const user = await User.findById(userId);

        if (!reward) return res.status(404).json({ message: "Reward not found" });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check the user points
        if (user.points < reward.pointsRequired) {
            return res.status(400).json({ message: "Not enough points to redeem this reward" });
        }

        // Check the max usage 
        const userRedemptionCount = reward.usersRedeemed.filter(id => id.toString() === userId.toString()).length;

        if (userRedemptionCount >= reward.maxUsage) {
            return res.status(400).json({ message: "You have already redeemed this reward the maximum number of times" });
        }

        // Check the expiry date
        const today = new Date();
        const expiryDate = new Date(reward.expiryDate);

        if (today > expiryDate) {
            reward.isActive = false;
            await reward.save();
            return res.status(400).json({ message: "The Coupon has expired" });
        }

        // Deduct points
        user.points -= reward.pointsRequired;
        reward.usersRedeemed.push(userId);
        reward.usedCount += 1;
        await reward.save();
        await user.save();

        res.status(200).json({ message: "Reward redeemed successfully", coupon: reward });
    } catch (error) {
        res.status(500).json({ message: "Error redeeming reward", error });
    }
};
