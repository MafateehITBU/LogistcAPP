const asyncHandler = require('express-async-handler');
const userAuth = require('./userAuthMiddleware');
const captainAuth = require('./capitnAuthMidllware');

// Middleware to authenticate either a user or a captain
const userOrCaptainAuth = asyncHandler(async (req, res, next) => {
    // Save original `res.json` and `res.status` methods
    const originalJson = res.json;
    const originalStatus = res.status;

    try {
        // Override `res.json` and `res.status` temporarily to suppress responses
        res.json = (data) => {
            throw new Error(data.message || 'Unauthorized'); // Throw an error instead of sending a response
        };
        res.status = (code) => {
            res.statusCode = code; // Save the status code for debugging
            return res; // Chainable
        };

        // Try user authentication
        await new Promise((resolve, reject) => {
            userAuth(req, res, (err) => (err ? reject(err) : resolve()));
        });

        // If user authentication succeeds, restore `res` and proceed
        res.json = originalJson;
        res.status = originalStatus;
        return next();
    } catch (userError) {
        // Restore original `res.json` and `res.status` before trying captain authentication
        res.json = originalJson;
        res.status = originalStatus;

        try {
            // Try captain authentication
            await new Promise((resolve, reject) => {
                captainAuth(req, res, (err) => (err ? reject(err) : resolve()));
            });

            // If captain authentication succeeds, proceed
            return next();
        } catch (captainError) {
            // If both fail, return an error response
            res.status(401).json({
                message: 'Unauthorized: Not a user or captain',
                errors: { userError: userError.message, captainError: captainError.message },
            });
        }
    }
});

module.exports = userOrCaptainAuth;