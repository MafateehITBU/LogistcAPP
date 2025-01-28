const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userAuth = require('../middlewares/userAuthMiddleware'); 


// Routes
router.post('/', userAuth,orderController.createOrder);


module.exports = router;
