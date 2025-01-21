const express = require('express');
const router = express.Router();
const carController = require ('../controllers/carController');
const captainAuth = require('../middlewares/capitnAuthMidllware');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const userAuth = require('../middlewares/userAuthMiddleware');

// Create new car
router.post('/create', carController.createNewCar);

// Get all cars
router.get('/', adminAuth,  carController.getAllCars);

// Get a single car by ID
router.get('/:id', carController.getCar);

// Update a car by ID
router.put('/:id', adminAuth, carController.updateCar);

// Delete a car by ID
router.delete('/:id', adminAuth, carController.deleteCar);

module.exports = router;