    const express = require("express");
    const router = express.Router();
    const couponController = require("../controllers/couponController");
    const userAuth = require('../middlewares/userAuthMiddleware'); 
    const adminAuth = require('../middlewares/adminAuthMiddleware'); 

    // Get all coupons
    router.get("/", adminAuth, couponController.getAllCoupons);

    // Get a single coupon
    router.get("/:id", couponController.getCouponById);

    // Create a coupon
    router.post("/", adminAuth, couponController.createCoupon);

    // Update a coupon
    router.put("/:id", adminAuth, couponController.updateCoupon);

    // Delete a coupon
    router.delete("/:id", adminAuth, couponController.deleteCoupon);

    // Redeem a coupon
    router.post("/:id/redeem", userAuth, couponController.redeemCoupon);

    module.exports = router;
