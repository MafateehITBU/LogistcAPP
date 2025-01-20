const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Captain = require('../models/Captain');
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

// Profile picture upload handler
exports.uploadProfilePicture = [
    upload.single('profilePic'),
    async (req, res) => {
        try {
            // Ensure the file is uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Upload image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);

            // Get the URL of the uploaded image
            const imageUrl = result.secure_url;

            // Use the user ID from the decoded token to find and update the user
            const user = await User.findByIdAndUpdate(
                req.user.userId,
                { profilePicture: imageUrl },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Delete the temporary file after uploading to Cloudinary
            fs.unlinkSync(req.file.path);

            // Return the updated user with the new profile picture
            res.status(200).json({ message: 'Profile picture uploaded successfully', user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Sign-up controller
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role, contractType } = req.body;
    const captain = new Captain({ name, email, password, phone, role, contractType });
    await captain.save();
    res.status(201).json({ message: 'Captain created successfully', captain });
});

// Sign-in controller
exports.signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const captain = await Captain.findOne({ email });
    if (!captain) return res.status(404).json({ error: 'Captain not found' });

    const isMatch = await bcrypt.compare(password, captain.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

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
exports.updateCaptain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const captain = await Captain.findByIdAndUpdate(id, updates, { new: true });
    if (!captain) return res.status(404).json({ error: 'Captain not found' });
    res.status(200).json({ message: 'Captain updated successfully', captain });
});

// Delete captain controller
exports.deleteCaptain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const captain = await Captain.findByIdAndDelete(id);
    if (!captain) return res.status(404).json({ error: 'Captain not found' });
    res.status(200).json({ message: 'Captain deleted successfully' });
});