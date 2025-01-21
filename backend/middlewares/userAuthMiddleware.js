const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Middleware to authenticate user
const userAuth = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // Extract the token

        // Verify token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error('Invalid or expired token');
            }

            // Find the user based on the decoded token ID
            const user = await User.findById(decoded.userId);
            if (!user) {
                res.status(401);
                throw new Error('User not found');
            }

            // Attach the user object to the request for further use in controllers
            req.user = user;
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        res.status(401);
        throw new Error('Authorization token missing');
    }
});

module.exports = userAuth;