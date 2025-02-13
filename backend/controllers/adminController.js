const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// AddAdmin (signup)
const addAdmin = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const admin = new Admin({
            name,
            email,
            password,
            phone,
            role
        });
        await admin.save();
        res.status(201).json({ message: 'Admin added successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid request' });
    }
});

// Login 
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Email and Password are required');
    }

    // Convert email to lowercase
    const lowercaseEmail = email.toLowerCase();

    // Check if admin exists
    const admin = await Admin.findOne({ email: lowercaseEmail });

    // Check if password matches
    if (admin && (await bcrypt.compare(password, admin.password))) {
        console.log("Password is correct!");

        // Create token
        const accessToken = jwt.sign(
            { id: admin.id, role: admin.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10h" }
        );

        const role = admin.role;

        console.log("Generated Token:", accessToken, role); // Log the token

        res.status(200).json({ accessToken, role });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// Get all Admins
const getAdmins = asyncHandler(async (req, res) => {
    const admins = await Admin.find();
    res.status(200).json(admins);
});

// Change Admin Role
const changeAdminRole = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const role = req.body.role;
    const admin = await Admin.findByIdAndUpdate(id, { role: role }, { new: true });
    res.status(200).json(admin);
});

// Delete an Admin
const deleteAdmin = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted successfully" });
});

module.exports = {addAdmin, loginAdmin, getAdmins, changeAdminRole, deleteAdmin };