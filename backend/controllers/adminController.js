const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Salary = require('../models/Salary');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// AddAdmin (signup)
const addAdmin = [
    upload.single('profilePic'),
    asyncHandler(async (req, res) => {
        try {
            const { name, email, password, phone, role, salary } = req.body;
            const lowercaseEmail = email.toLowerCase();

            // Check if a file is uploaded
            let profilePictureUrl = null;
            if (req.file) {
                // Upload the file to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path);
                profilePictureUrl = result.secure_url;

                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            }
            // Check if the email already exists
            const existingAdmin = await Admin.findOne({ email: lowercaseEmail });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const newSalary = new Salary({
                startDate: new Date(),
                position: role,
                salary
            })

            const createdSalary = await newSalary.save();

            const admin = new Admin({
                name,
                email: lowercaseEmail,
                password,
                phone,
                role,
                profilePicture: profilePictureUrl,
                salaryId: createdSalary.id,
            });
            await admin.save();
            res.status(201).json({ message: 'Admin added successfully', admin });
        } catch (error) {
            res.status(400).json({ message: 'Invalid request' });
        }
    })
];

// Login 
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and Password are required' });
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

// Get admin info
const getSingleAdmin = asyncHandler(async (req, res) => {
    const id = req.admin._id;
    const admin = await Admin.findById(id);
    if (!admin) {
        res.status(404).json({ status: 'Admin Not Found' });
    }
    res.status(200).json({ adminInfo: admin });
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

    try {
        // Find the admin first
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Delete the associated salary
        if (admin.salaryId) {
            await Salary.findByIdAndDelete(admin.salaryId);
        }

        // Delete the admin
        await Admin.findByIdAndDelete(id);

        res.status(200).json({ message: "Admin and associated salary deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting admin", error: error.message });
    }
});


module.exports = { addAdmin, loginAdmin, getAdmins, getSingleAdmin, changeAdminRole, deleteAdmin };