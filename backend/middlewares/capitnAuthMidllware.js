const jwt = require('jsonwebtoken');
const Captain = require('../models/FulltimeCaptain');
const FreelanceCaptain = require('../models/freelanceCaptain');
const asyncHandler = require('express-async-handler');

// Middleware to authenticate captain
const captainAuth = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // Extract the token

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // Find the captain based on the decoded token ID
            let captain = await Captain.findById(decoded.captainId);
            if (!captain) {
                captain = await FreelanceCaptain.findById(decoded.captainId);
            }

            if (!captain) {
                return res.status(401).json({ message: 'Captain not found' });
            }

            // Attach the captain object to the request for further use in controllers
            req.captain = captain;
            next(); // Proceed to the next middleware or route handler
        } catch (err) {
            console.error(err);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    } else {
        return res.status(401).json({ message: 'Authorization token missing' });
    }
});

module.exports = captainAuth;
