const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const userAuth = require('../middlewares/userAuthMiddleware'); 
const adminAuth = require('../middlewares/adminAuthMiddleware'); 

// Routes
router.post('/', userAuth, itemController.addItem); // Add new item
router.get('/', adminAuth ,itemController.getAllItems); // Get all items
router.get('/user-items', userAuth, itemController.getUserItems);
router.get('/:id', itemController.getItem); // Get single item
router.put('/:id', userAuth, itemController.updateItem); // Update item
router.delete('/:id', userAuth, itemController.deleteItem); // Delete item

module.exports = router;
