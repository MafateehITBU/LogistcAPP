const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAdmin } = require('../middlewares/authMiddleware');
const validateToken = require('../middlewares/validateTokenHandler');

// Sign up route
router.post('/signup', userController.signup);

// Sign in route
router.post('/signin', userController.signin);

// Get all users
router.get('/', isAdmin, userController.getAllUsers);

// Get a single user by ID
router.get('/:id', userController.getUser);

// Update a user by ID
router.put('/:id', userController.updateUser);

// Delete a user by ID
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;

