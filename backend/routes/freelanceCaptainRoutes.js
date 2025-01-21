const express = require('express');
const router = express.Router();
const captainController = require('../controllers/fulltimeCaptainController');
const captainAuth = require('../middlewares/capitnAuthMidllware');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const userAuth = require('../middlewares/userAuthMiddleware');

// Sign up route
router.post('/signup', adminAuth, captainController.signup);

// Sign-in route
router.post('/signin', captainController.signin);

// Get all captains route
router.get('/', adminAuth, captainController.getAllCaptains);

// Get a single captain by ID
router.get('/:id', captainController.getCaptain);

// Update a captain by ID
router.put('/:id', captainAuth, captainController.updateCaptain);

// Delete a captain by ID
router.delete('/:id', adminAuth, captainController.deleteCaptain);

module.exports = router;
