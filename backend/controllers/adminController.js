const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Sign up
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
        res.status(400);
        throw new Error('Email and Password are required');
    }
    // Checking if the Admin already in the database
    const adminAvailable = await Admin.findOne({ email });
    if (adminAvailable) {
        res.status(400);
        throw new Error('Admin already exists');
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    const admin = await Admin.create({
        name,
        email,
        password,
        phone
    });

    if (admin) {
        res.status(200).json({ _id: admin.id, email: admin.email, name: admin.name });
    } else {
        res.status(400);
        throw new Error('Admin data is not valid');
    }
    res.json({ message: "Register Admin" });
});

// Login 
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Email and Password are required');
    }
    
    // Check if admin exists
    const admin = await Admin.findOne({ email: email });
    
    // Check if password matches
    if (admin && (await bcrypt.compare(password, admin.password))) {
        console.log("Password is correct!");
        
        // Create token
        const accessToken = jwt.sign({ id: admin.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
        
        console.log("Generated Token:", accessToken);  // Log the token
        
        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});


module.exports = { registerAdmin, loginAdmin };