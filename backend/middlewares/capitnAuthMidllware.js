const jwt = require('jsonwebtoken');
const Captain = require('../models/Captain');
const asyncHandler = require('express-async-handler');

// Middleware to authenticate captain
const captainAuth = asyncHandler(async (req, res, next) => {
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

            // Find the captain based on the decoded token ID
            const captain = await Captain.findById(decoded.captainId);
            if (!captain) {
                res.status(401);
                throw new Error('Captain not found');
            }

            // Attach the captain object to the request for further use in controllers
            req.captain = captain;
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        res.status(401);
        throw new Error('Authorization token missing');
    }
});

module.exports = captainAuth;