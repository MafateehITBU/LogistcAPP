const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Decoded Token:', decoded);

        // Use the decoded id to find the admin
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            console.log('Admin not found');
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return res.status(403).json({ message: 'Invalid token or not authorized.' });
    }
};

module.exports = { isAdmin };
