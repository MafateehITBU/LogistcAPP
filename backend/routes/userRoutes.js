const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const captainAuth = require('../middlewares/capitnAuthMidllware');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const userAuth = require('../middlewares/userAuthMiddleware');

// Sign up route
router.post('/signup', userController.signup);

// Sign in route
router.post('/signin', userController.signin);

// Get all users
router.get('/', adminAuth, userController.getAllUsers);

// Get a single user by ID
router.get('/:id', userController.getUser);

// Update a user by ID
router.put('/:id', userController.updateUser);

// Delete a user by ID
router.delete('/:id', adminAuth, userController.deleteUser);

module.exports = router;

