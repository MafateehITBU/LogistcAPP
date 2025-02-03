const express = require('express');
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const userAuth = require('../middlewares/userAuthMiddleware');
const adminAuth = require('../middlewares/adminAuthMiddleware');


const router = express.Router();

router.post('/', userAuth, createOrder); // Create order
router.get('/', userAuth, getUserOrders); // Get orders for the authenticated user
router.get('/all', adminAuth, getAllOrders); // Admin: Get all orders
router.put('/status', adminAuth, updateOrderStatus); // Update order status

module.exports = router;
