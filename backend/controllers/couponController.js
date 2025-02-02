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

// Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Error fetching coupons", error });
    }
};

// Get a single coupon by ID
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });

        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: "Error fetching coupon", error });
    }
};

// Create a new coupon manually (if needed)
exports.createCoupon = async (req, res) => {
    try {
        const { discountType, discountValue, minPointsRequired, maxUsage, expiryDate } = req.body;

        if (!["percentage", "fixed"].includes(discountType)) {
            return res.status(400).json({ message: "Invalid discount type" });
        }

        const code = await generateUniqueCode();

        const newCoupon = new Coupon({
            code,
            discountType,
            discountValue,
            minPointsRequired,
            maxUsage,
            expiryDate
        });

        await newCoupon.save();
        res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: "Error creating coupon", error });
    }
};

// Update coupon details (only if necessary)
exports.updateCoupon = async (req, res) => {
    try {
        const { discountType, discountValue, minPointsRequired, maxUsage, expiryDate, isActive } = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { discountType, discountValue, minPointsRequired, maxUsage, expiryDate, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedCoupon) return res.status(404).json({ message: "Coupon not found" });

        res.status(200).json({ message: "Coupon updated successfully", coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ message: "Error updating coupon", error });
    }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });

        await coupon.deleteOne();
        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting coupon", error });
    }
};

// Mark coupon as used (for redemption)
exports.redeemCoupon = async (req, res) => {
    try {
        const userId = req.user._id;
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        if (!coupon.isActive) return res.status(400).json({ message: "Coupon is inactive" });

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if the user has enough points
        if (user.points < coupon.minPointsRequired) {
            return res.status(400).json({ message: "Not enough points to redeem this coupon" });
        }

        // Count how many times the user has redeemed the coupon
        const userRedemptionCount = coupon.usersRedeemed.filter(id => id.toString() === userId.toString()).length;

        // Check if the user has reached the maxUsage for the specific coupon
        if (userRedemptionCount >= coupon.maxUsage) {
            return res.status(400).json({ message: "You have already redeemed this coupon the maximum number of times" });
        }

        // Redeem the coupon
        coupon.usedCount += 1;
        coupon.usersRedeemed.push(userId);

        // If max usage is reached, deactivate the coupon
        if (coupon.usedCount >= coupon.maxUsage) {
            coupon.isActive = false;
        }

        // Deduct points from user
        user.points -= coupon.minPointsRequired;

        await coupon.save();
        await user.save();

        res.status(200).json({ message: "Coupon redeemed successfully", coupon });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error redeeming coupon", error });
    }
};
