const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Sign up
const registerAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Email and Password are required');
    }
    // Checking if the Admin already in the database
    const adminAvailable = await Admin.findOne({ email });
    if (adminAvailable) {
        res.status(400);
        throw new Error('Admin already exists');
    }

    const admin = await Admin.create({
        email,
        password
    });

    if (admin) {
        res.status(200).json({ _id: admin.id, email: admin.email });
    } else {
        res.status(400);
        throw new Error('Admin data is not valid');
    }
    res.json({ message: "Register Admin" });
});

module.exports = {registerAdmin};