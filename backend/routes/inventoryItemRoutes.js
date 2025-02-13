const express = require('express');
const router = express.Router();
const itemController = require('../controllers/inventoryItemController');
const userAuth = require('../middlewares/userAuthMiddleware'); 
const adminAuth = require('../middlewares/adminAuthMiddleware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

// Routes
router.post('/', userAuth, itemController.addItem); // Add new item
router.get('/', adminAuth, adminRoleMiddleware('Admin', 'StoreKeeper'), itemController.getAllItems); // Get all items
router.get('/user-items', userAuth, itemController.getUserItems);
router.get('/:id', itemController.getItem); // Get single item
router.put('/:id', userAuth, itemController.updateItem); // Update item
router.put('/updateSdk/:id', adminAuth, adminRoleMiddleware('Admin', 'StoreKeeper'), itemController.updateSDK);
router.delete('/:id', userAuth, itemController.deleteItem); // Delete item

module.exports = router;
