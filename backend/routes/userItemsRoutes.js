const express = require('express');
const router = express.Router();
const userItemsController = require('../controllers/userItemsController');
const userAuth = require('../middlewares/userAuthMiddleware');

// Get all items for the authenticated user
router.get('/', userAuth, userItemsController.getAllItems);

// Get a single item by ID
router.get('/:id', userAuth, userItemsController.getItem);

// Create a new item
router.post('/', userAuth, userItemsController.createItem);

// Update an item by ID
router.put('/:id', userAuth, userItemsController.updateItem);

// Delete an item by ID
router.delete('/:id', userAuth, userItemsController.deleteItem);

module.exports = router;
