const express = require('express');
const router = express.Router();
const captainController = require('../controllers/captainController');
const { isAdmin } = require('../middlewares/authMiddleware');
const validateCaptainToken = require('../middlewares/captainTokenHandler');

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

module.exports = router;
