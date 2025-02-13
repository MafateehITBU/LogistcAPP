const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const userAuth = require('../middlewares/userAuthMiddleware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

// Sign up route
router.post('/signup', userController.signup);

// Sign in route
router.post('/signin', userController.signin);

// Get all users
router.get('/', adminAuth, adminRoleMiddleware('Admin','HR'), userController.getAllUsers);

// Get a single user by ID
router.get('/:id', userController.getUser);

// Update a user by ID
router.put('/update',userAuth, userController.updateUser);

// Delete a user by ID
router.delete('/:id', adminAuth, adminRoleMiddleware('Admin','HR'), userController.deleteUser);

//Sending OTP
router.post('/sendOTP', userController.sendOTP);

// Confirm OTP
router.post('/confirmOTP', userController.confirmOTP);

// Reset Password
router.post('/resetPassword', userController.resetPassword);

module.exports = router;

