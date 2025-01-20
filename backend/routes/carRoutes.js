const express = require('express');
const router = express.Router();
const carController = require ('../controllers/carController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Create new car
router.post('/create', carController.createNewCar);

// Get all cars
router.get('/', isAdmin,  carController.getAllCars);

// Get a single car by ID
router.get('/:id', carController.getCar);

// Update a car by ID
router.put('/:id', isAdmin, carController.updateCar);

// Delete a car by ID
router.delete('/:id', isAdmin, carController.deleteCar);

module.exports = router;