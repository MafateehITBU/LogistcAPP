const User = require('../models/User');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
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
            const { name, email, password, phone, age, gender, role } = req.body;

            const lowercaseEmail = email.toLowerCase();

            // Validate gender
            if (!['male', 'female'].includes(gender)) {
                return res.status(400).json({ error: 'Gender must be male or female' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Check if a file is uploaded
            let profilePictureUrl = null;
            if (req.file) {
                // Upload the file to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path);
                profilePictureUrl = result.secure_url;

                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            }

            let user;

            if (role === 'partner') {
                const inventory = new Inventory();
                const createdInventory = await inventory.save();

                user = new User({
                    name,
                    email: lowercaseEmail,
                    password: hashedPassword,
                    phone,
                    age,
                    gender,
                    profilePicture: profilePictureUrl, // Save the picture URL
                    role,
                    inventory: createdInventory.id,
                });
            } else {
                user = new User({
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    age,
                    gender,
                    profilePicture: profilePictureUrl, // Save the picture URL
                    role,
                });
            }

            // Save the user to the database
            await user.save();

            res.status(201).json({
                message: 'User created successfully',
                user,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
];

// Sign-in controller
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowercaseEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowercaseEmail });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Sign-in successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users controller
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single user controller
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user controller
exports.updateUser = [
    upload.single('profilePic'),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        let updates = req.body;

        try {
            // Validate gender if provided
            if (updates.gender && !['male', 'female'].includes(updates.gender)) {
                return res.status(400).json({ error: 'Gender must be male or female' });
            }

            // Check if a file is uploaded for profilePic
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path);
                const profilePictureUrl = result.secure_url;

                updates.profilePicture = profilePictureUrl;

                fs.unlinkSync(req.file.path);
            }

            const user = await User.findByIdAndUpdate(id, updates, { new: true });
            if (!user) return res.status(404).json({ error: 'User not found' });

            res.status(200).json({ message: 'User updated successfully', user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
];

// Delete user controller
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
