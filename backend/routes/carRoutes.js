const express = require('express');
const router = express.Router();
const carController = require ('../controllers/carController');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

// Create new car
router.post('/create', carController.createNewCar);

// Get all cars
router.get('/', adminAuth, adminRoleMiddleware('Admin', 'Dispatcher'),  carController.getAllCars);

// Get a single car by ID
router.get('/:id', carController.getCar);

// Update a car by ID
router.put('/:id', adminAuth, adminRoleMiddleware('Admin', 'Dispatcher'), carController.updateCar);

// Delete a car by ID
router.delete('/:id', adminAuth, adminRoleMiddleware('Admin', 'Dispatcher'), carController.deleteCar);

module.exports = router;