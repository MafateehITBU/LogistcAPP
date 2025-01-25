const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
        const accessToken = jwt.sign({ id: admin.id, role: "admin" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        
        console.log("Generated Token:", accessToken);  // Log the token
        
        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});


module.exports = {loginAdmin };