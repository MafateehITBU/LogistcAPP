const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Captain = require('../models/FulltimeCaptain');
const Car = require('../models/Car');
const Salary = require('../models/Salary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Sign-up controller with profile picture upload
exports.signup = [
    upload.single('profilePic'),
    asyncHandler(async (req, res) => {
        try {
            const { name, email, password, phone, role, shift } = req.body;
            const lowercaseEmail = email.toLowerCase();

            // Check if a file is uploaded
            let profilePictureUrl = null;
            if (req.file) {
                // Upload the file to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path);
                profilePictureUrl = result.secure_url;

                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            }

            const captain = new Captain({
                name,
                email: lowercaseEmail,
                password,
                phone,
                role,
                shift,
                profilePicture: profilePictureUrl, // Save the picture URL
            });
            await captain.save();

            res.status(201).json({
                message: 'Captain created successfully',
                captain,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
];

// Sign-in controller
exports.signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const lowercaseEmail = email.toLowerCase();
    const captain = await Captain.findOne({ email: lowercaseEmail });
    if (!captain) return res.status(404).json({ error: 'Captain not found' });

    const isMatch = await bcrypt.compare(password, captain.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    if (captain.accountStatus !== 'approved') {
        return res.status(403).json({ error: 'Captain profile is not approved yet!' });
    }

    const token = jwt.sign({ captainId: captain.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Sign-in successful', token });
});

// Get All Captains controller
exports.getAllCaptains = asyncHandler(async (req, res) => {
    const captains = await Captain.find();
    res.status(200).json(captains);
});

// Get a single Captain controller
exports.getCaptain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const captain = await Captain.findById(id);
    if (!captain) return res.status(404).json({ error: 'Captain not found' });
    res.status(200).json(captain);
});

// Update captain controller
exports.updateCaptain = [
    upload.single('profilePic'),
    asyncHandler(async (req, res) => {
        const id = req.captain._id;
        let updates = req.body;

        try {
            // Check if a file is uploaded for profilePic
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path);
                const profilePictureUrl = result.secure_url;
                updates.profilePicture = profilePictureUrl;

                fs.unlinkSync(req.file.path);
            }

            const captain = await Captain.findByIdAndUpdate(id, updates, { new: true });
            if (!captain) return res.status(404).json({ error: 'Captain not found' });

            res.status(200).json({ message: 'Captain updated successfully', captain });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
];

// Assign Car by Admin
exports.assignCar = asyncHandler(async (req, res) => {
    const { carId, captainId } = req.body;
    const car = await Car.findById(carId);
    const captain = await Captain.findById(captainId);
    if (!car || !captain) return res.status(404).json({ error: 'Could not fid the captain or car!' });
    captain.car_id = car._id;
    await captain.save();
    res.status(200).json({ message: 'Car assigned to captain successfully' });
});

// Update account status by Admin
exports.updateAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountStatus } = req.body;

        // Allowed status updates for Admin
        const allowedStatuses = ['pending', 'approved', 'incomplete', 'rejected'];

        // Check if the provided status is valid
        if (!allowedStatuses.includes(accountStatus)) {
            return res.status(400).json({
                message: `Invalid status. Admin can only change status to ${allowedStatuses.join(', ')}`
            });
        }

        // Find the captain by ID
        const captain = await Captain.findById(id);
        if (!captain) {
            return res.status(404).json({ message: 'captain not found' });
        }

        // Update the status
        captain.accountStatus = accountStatus;

        if (accountStatus === 'approved') {
            const salary = new Salary({
                startDate: new Date(),
                position: 'Fulltime Captain',
            });

            const createdSalary = await salary.save();
            captain.salaryId = createdSalary.id;
        }

        await captain.save();

        res.status(200).json({
            message: 'captain status updated successfully',
            captain
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete captain controller
exports.deleteCaptain = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const captain = await Captain.findById(id);
        if (!captain) return res.status(404).json({ error: 'Captain not found' });

        // If the captain has a salary, delete it
        if (captain.salaryId) {
            await Salary.findByIdAndDelete(captain.salaryId);
        }

        // Delete the captain
        await Captain.findByIdAndDelete(id);

        res.status(200).json({ message: 'Captain and associated salary deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});