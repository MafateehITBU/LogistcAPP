const Item = require('../models/Item');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const asyncHandler = require('express-async-handler');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Temporary upload folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Add new item
exports.addItem = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, quantity, price, type, expireDate, weight, height, width, length, distance } = req.body;
      const ownerId = req.user._id; // Assuming user authentication middleware attaches user to req

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

      await item.save();

      res.status(201).json({
        message: 'Item created successfully',
        item
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('ownerId', 'name email');
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single item by ID
exports.getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id).populate('ownerId', 'name email');
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update item
exports.updateItem = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.type && !['Breakable', 'Refrigerant', 'Normal'].includes(updates.type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }

      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        updates.image = uploadResult.secure_url;
        fs.unlinkSync(req.file.path); // Delete local file after upload
      }

      const item = await Item.findByIdAndUpdate(id, updates, { new: true });
      if (!item) return res.status(404).json({ error: 'Item not found' });

      res.status(200).json({
        message: 'Item updated successfully',
        item
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getUserItems = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;  // Get the user ID from the authenticated user
        const items = await Item.find({ owner: userId });  // Find items by user ID

        if (items.length === 0) {
            return res.status(404).json({ message: 'No items found for this user' });
        }

        res.status(200).json(items);  // Return all the user's items
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});