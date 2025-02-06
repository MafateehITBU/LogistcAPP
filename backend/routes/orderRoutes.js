const express = require('express');
const { createOrder, getUserOrders, getAllOrders, editOrderDetails,assignCaptains } = require('../controllers/orderController');
const userAuth = require('../middlewares/userAuthMiddleware');
const adminAuth = require('../middlewares/adminAuthMiddleware');


const router = express.Router();

router.post('/', userAuth, createOrder); // Create order
router.get('/', userAuth, getUserOrders); // Get orders for the authenticated user
router.get('/all', adminAuth, getAllOrders); // Admin: Get all orders
router.put('/:orderId', userAuth, editOrderDetails); // Edit order details
router.put('/:orderId/assign-captains', adminAuth, assignCaptains);// Assign procurement officer and delivery captain

module.exports = router;
