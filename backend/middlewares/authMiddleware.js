const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify admin access
const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            console.log("admin Found");

            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        req.admin = admin;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token or not authorized.' });
    }
};

module.exports = { isAdmin };
