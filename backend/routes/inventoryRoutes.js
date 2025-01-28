const express = require('express');
const router = express.Router();
const inventoryController = require ('../controllers/inventoryController');
const userAuth = require('../middlewares/userAuthMiddleware'); 
const adminAuth = require('../middlewares/adminAuthMiddleware'); 

// Get all inventories
router.get('/', adminAuth, inventoryController.getAllInventories);

// Get user inventory
router.get('/user-inventory', userAuth, inventoryController.getUserInventory);

// Get single inventory
router.get('/:id', inventoryController.getInventory);

// Delete a single inventory
router.delete('/:id', adminAuth, inventoryController.deleteInventory);

module.exports = router;