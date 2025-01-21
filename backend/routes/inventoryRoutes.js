const express = require('express');
const router = express.Router();
const inventoryController = require ('../controllers/inventoryController');
const userAuth = require('../middlewares/userAuthMiddleware'); 
const adminAuth = require('../middlewares/adminAuthMiddleware'); 

// Create a new inventory
router.post('/create', userAuth, inventoryController.createInventory);

// Get all inventories
router.get('/', adminAuth, inventoryController.getAllInventories);

// Get user inventories
router.get('/user-inventories', userAuth, inventoryController.getUserInventories);

// Get single inventory
router.get('/:id', inventoryController.getInventory);

// Delete a single inventory
router.delete('/:id', adminAuth, inventoryController.deleteInventory);




module.exports = router;