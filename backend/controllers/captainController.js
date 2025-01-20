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

// Sign-up controller with profile picture upload
exports.signup = [
    upload.single('profilePic'),
    asyncHandler(async (req, res) => {
        try {
            const { name, email, password, phone, role, contractType } = req.body;

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
                email,
                password,
                phone,
                role,
                contractType,
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
exports.updateCaptain = [
    upload.single('profilePic'),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
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

// Delete captain controller
exports.deleteCaptain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const captain = await Captain.findByIdAndDelete(id);
    if (!captain) return res.status(404).json({ error: 'Captain not found' });
    res.status(200).json({ message: 'Captain deleted successfully' });
});