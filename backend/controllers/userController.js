const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Inventory = require('../models/Inventory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

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

            const wallet = new Wallet();
            const createdWallet = await wallet.save();

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
                    walletNo: createdWallet._id,
                    profilePicture: profilePictureUrl, // Save the picture URL
                    role,
                    inventory: createdInventory.id,
                });
            } else {
                user = new User({
                    name,
                    email: lowercaseEmail,
                    password: hashedPassword,
                    phone,
                    age,
                    gender,
                    walletNo: createdWallet._id,
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

        const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });
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
        const id = req.user._id;
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

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Send reset password OTP
exports.sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const lowercaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercaseEmail });

    if (!user) {
        return res.status(404).json({ error: 'user not found' });
    }

    // Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration time (3 minutes from now)
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 3);

    // Save OTP and expiry time in the database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    const mailOptions = {
        from: `"Nashmi Riders" <${process.env.EMAIL_USER}>`,
        to: lowercaseEmail,
        subject: 'Password Reset OTP',
        text: `Your OTP for resetting your password is: ${otp}. This OTP is valid for 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
});

// confirm OTP
exports.confirmOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const lowercaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercaseEmail });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (user.otp !== otp || new Date() > User.otpExpiry) {
        return res.status(401).json({ error: 'Invalid OTP' });
    }

    res.status(200).json({ message: "OTP correct!" });
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    const lowercaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercaseEmail });

    if (!user) {
        return res.status(404).json({ error: 'user not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
});