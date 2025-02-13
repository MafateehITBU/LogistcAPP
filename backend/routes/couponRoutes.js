    const express = require("express");
    const router = express.Router();
    const couponController = require("../controllers/couponController");
    const userAuth = require('../middlewares/userAuthMiddleware'); 
    const adminAuth = require('../middlewares/adminAuthMiddleware'); 

    // Get a single coupon
    router.get("/:id", couponController.getCouponById);

    // Update a coupon
    router.put("/:id", adminAuth, couponController.updateCoupon);

    module.exports = router;
