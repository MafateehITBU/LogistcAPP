const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/rewardController");
const userAuth = require('../middlewares/userAuthMiddleware'); 
const adminAuth = require('../middlewares/adminAuthMiddleware'); 

// Create reward with auto-generated coupon
router.post("/", adminAuth, rewardController.addReward); 

// Get all rewards
router.get("/", adminAuth, rewardController.getAllRewards);

// Get single reward
router.get("/:id", rewardController.getRewardById); 

// Update a reward
router.put("/:id", adminAuth, rewardController.updateReward);

// Delete a reward
router.delete("/:id", adminAuth, rewardController.deleteReward);

// Redeem a reward
router.post("/:id/redeem", userAuth, rewardController.redeemReward);

module.exports = router;
