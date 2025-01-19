const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Sign up
const register = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Email and Password are required');
    }
    // Checking if the user already in the database
    const userAvailable = await Admin.findOne({ email });
    if (userAvailable) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await Admin.create({
        email,
        password
    });

    if (user) {
        res.status(200).json({ _id: user.id, email: user.email });
    } else {
        res.status(400);
        throw new Error('User data is not valid');
    }
    res.json({ message: "Register User" });
});