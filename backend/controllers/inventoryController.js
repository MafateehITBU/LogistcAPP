const asyncHandler = require ('express-async-handler');
const Inventory = require ('../models/Inventory');
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

// create a new Inventory controller
exports.createInventory = [
    upload.single('productPic'),
    asyncHandler(async (req, res) => {
        try {
            const { productName, productOwner, productQuantity, productPrice, productType } = req.body;

            // Check if a file is uploaded
            let profilePictureUrl = null;
            if (req.file) {
                // Upload the file to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path);
                profilePictureUrl = result.secure_url;

                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            }

            const captain = new Captain({
                name,
                email,
                password,
                phone,
                role,
                shift,
                profilePicture: profilePictureUrl, // Save the picture URL
            });
            await captain.save();

            res.status(201).json({
                message: 'Captain created successfully',
                captain,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
];