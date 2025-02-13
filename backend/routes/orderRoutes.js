const express = require('express');
const { createOrder, getUserOrders, getAllOrders, editOrderDetails,assignCaptains, changeOrderStatusAdmin,changeOrderStatusByCaptain} = require('../controllers/orderController');
const userAuth = require('../middlewares/userAuthMiddleware');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const captainAuth = require('../middlewares/capitnAuthMidllware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

const router = express.Router();

router.post('/', userAuth, createOrder); // Create order
router.get('/', userAuth, getUserOrders); // Get orders for the authenticated user
router.get('/all', adminAuth, adminRoleMiddleware('Admin', 'Dispatcher'), getAllOrders); // Admin: Get all orders
router.put('/:orderId', userAuth, editOrderDetails); // Edit order details
router.put('/:orderId/assign-captains', adminAuth, adminRoleMiddleware('Admin', 'Dispatcher'), assignCaptains);// Assign procurement officer and delivery captain
router.put('/:orderId/change-status', adminAuth, adminRoleMiddleware('Admin', 'Dispatcher'), changeOrderStatusAdmin);
router.put('/:orderId/captain-change-status', captainAuth, changeOrderStatusByCaptain);

module.exports = router;
