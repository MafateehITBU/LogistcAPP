const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const asyncHandler = require('express-async-handler');

const adminAuth = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];

        // Verify token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error('Invalid or expired token');
            }

            // Find the admin based on the decoded token id
            const admin = await Admin.findById(decoded.id);
            if (!admin) {
                res.status(401);
                throw new Error('Admin not found');
            }

            // Attach the admin object to the request for further use in controllers
            req.admin = admin;
            next();  // Proceed to the next middleware or route handler
        });
    } else {
        res.status(401);
        throw new Error('Authorization token missing');
    }
});

module.exports = adminAuth;