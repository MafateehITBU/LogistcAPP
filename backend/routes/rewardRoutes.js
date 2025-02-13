const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/rewardController");
const userAuth = require('../middlewares/userAuthMiddleware'); 
const adminAuth = require('../middlewares/adminAuthMiddleware'); 
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

// Create reward with auto-generated coupon
router.post("/", adminAuth, adminRoleMiddleware('Admin'), rewardController.addReward); 

// Get all rewards
router.get("/", adminAuth, adminRoleMiddleware('Admin'), rewardController.getAllRewards);

// Get single reward
router.get("/:id", rewardController.getRewardById); 

// Update a reward
router.put("/:id", adminAuth, adminRoleMiddleware('Admin'), rewardController.updateReward);

// Delete a reward
router.delete("/:id", adminAuth, adminRoleMiddleware('Admin'), rewardController.deleteReward);

// Redeem a reward
router.post("/redeem", userAuth, rewardController.redeemReward);

module.exports = router;
