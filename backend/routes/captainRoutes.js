const express = require('express');
const router = express.Router();
const captainController = require('../controllers/captainController');
const { isAdmin } = require('../middlewares/authMiddleware');
const validateToken = require('../middlewares/validateTokenHandler');

// Sign up route
router.post('/signup', captainController.signup);

// Sign-in route
router.post('/signin', captainController.signin);

// Get all captains route
router.get('/', isAdmin, captainController.getAllCaptains);

// Get a single captain by ID
router.get('/:id', captainController.getCaptain);

// Update a captain by ID
router.put('/:id', isAdmin, captainController.updateCaptain);

// Delete a captain by ID
router.delete('/:id', isAdmin, captainController.deleteCaptain);

// Route for uploading profile picture
router.post('/upload-profile-picture', validateToken, captainController.uploadProfilePicture);

module.exports = router;
