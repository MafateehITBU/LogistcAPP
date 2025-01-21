const asyncHandler = require('express-async-handler');
const Car = require('../models/Car');

// Create a new car controller 
exports.createNewCar = asyncHandler(async (req,res)=>{
    const {car_palette, car_type, manufactureYear, licenseExpiryDate, insuranceType, carOwnership} = req.body;
    const car = new Car({car_palette, car_type, manufactureYear, licenseExpiryDate, insuranceType, carOwnership});
    const createdCar = await car.save();
    res.status(201).json(createdCar);
});

// Get All Cars conroller
exports.getAllCars = asyncHandler(async (req, res) => {
    const cars = await Car.find();
    res.status(200).json(cars);
});

// Get a single Car controller
exports.getCar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.status(200).json(car);
});

// Update a car controller
exports.updateCar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { car_palette, car_type, manufactureYear, licenseExpiryDate, insuranceType, carOwnership } = req.body;
    const car = await Car.findByIdAndUpdate(id, { car_palette, car_type, manufactureYear, licenseExpiryDate, insuranceType, carOwnership }, { new: true});
    if (!car) return res.status(404).json({ error: 'Car not found'});
    res.status(200).json({message: "Car Updated successfuly",car});
});

// Delete a car controller
exports.deleteCar = asyncHandler (async (req, res)=>{
    const {id} = req.params;
    const car = await Car.findByIdAndDelete(id);
    if(!car) return res.status(404).json({error: 'Car not found'});
    res.status(200).json({message: 'Car deleted successfully'});
});