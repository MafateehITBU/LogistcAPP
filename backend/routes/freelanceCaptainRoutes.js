const express = require('express');
const router = express.Router();
const captainController = require('../controllers/freelanceCaptainController');
const captainAuth = require('../middlewares/capitnAuthMidllware');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const userAuth = require('../middlewares/userAuthMiddleware');

// Sign up route
router.post('/signup', captainController.signup);

// Sign-in route
router.post('/signin', captainController.signin);

// Get all captains route
router.get('/', adminAuth, captainController.getAllCaptains);

// Get all delivery captains
router.get('/delivery', adminAuth, captainController.getDeliveryCaptains);

// Get a single captain by ID
router.get('/:id', captainController.getCaptain);

// Update a captain by ID
router.put('/update', captainAuth, captainController.updateCaptain);

// Re-upload the docs
router.put('/reupload', captainAuth, captainController.reuploadDocs);

// Update account Status
router.put('/:id/updateStatus', adminAuth, captainController.updateAccountStatus);

// Delete a captain by ID
router.delete('/:id', adminAuth, captainController.deleteCaptain);

module.exports = router;
