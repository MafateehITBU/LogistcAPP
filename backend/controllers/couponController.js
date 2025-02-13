const Coupon = require("../models/Coupon");

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
