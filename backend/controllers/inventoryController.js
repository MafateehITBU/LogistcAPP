const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const Item = require('../models/Item');
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

// Create a new Inventory controller
exports.createInventory = [
    upload.single('image'),
    asyncHandler(async (req, res) => {
        try {
            const { name, quantity, price, type, expireDate, weight, height, width, length, distance } = req.body;
            const ownerId = req.user._id;

            if (!['Breakable', 'Refrigerant', 'Normal'].includes(type)) {
                return res.status(400).json({ error: 'Invalid type' });
            }

            let imageUrl = null;
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path);
                imageUrl = uploadResult.secure_url;
                fs.unlinkSync(req.file.path); // Delete local file after upload
            }

            const item = new Item({
                name,
                quantity,
                price,
                image: imageUrl,
                type,
                expireDate: expireDate || null,
                weight,
                height,
                width,
                length,
                distance,
                ownerId
            });

            const createdItem = await item.save();

            // Create the inventory and associate the item ID
            const inventory = new Inventory({
                item_id: createdItem._id
            })
            await inventory.save();
            res.status(201).json({ message: 'Inventory created successfully', data: createdItem });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
];

// Get all inventories and associated item controller
exports.getAllInventories = asyncHandler(async (req, res) => {
    try {
        const inventory = await Inventory.find().populate('item_id').exec();
        res.status(200).json({ data: inventory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single inventory by ID controller
exports.getInventory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.findById(id).populate('item_id');

        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found' });
        }

        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete inventory controller
exports.deleteInventory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        await Inventory.findByIdAndDelete(id);
        res.status(200).json({ message: 'Inventory deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user inventories\
exports.getUserInventories = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all inventories where the associated item's ownerId matches the userId
        const inventories = await Inventory.find()
            .populate({
                path: 'item_id',
                match: { ownerId: userId },
            })
            .exec();

        res.status(200).json({ data: inventories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
