const Item = require('../models/InventoryItem');
const Inventory = require('../models/Inventory');
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
// Add new item
exports.addItem = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, quantity, price, type, expireDate, weight, height, width, length, distance } = req.body;
      const ownerId = req.user._id; // Assuming user authentication middleware attaches user to req
      let inventoryId = req.user.inventory; // Assuming user's inventory ID is stored in req.user.inventory

      // Validate the type field
      if (!['Breakable', 'Refrigerant', 'Normal'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }

      let imageUrl = null;
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        imageUrl = uploadResult.secure_url;
        fs.unlinkSync(req.file.path); // Delete local file after upload
      }

      // Check if the user has an inventory, if not, create a new one
      let inventory = await Inventory.findById(inventoryId);
      if (!inventory) {
        inventory = new Inventory({ items: [] });
        await inventory.save();
        req.user.inventory = inventory._id;
        await req.user.save();
      }

      // Create a new Item
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
        ownerId,
      });

      await item.save(); // Save the item to the database

      // Add the new item ID to the inventory
      inventory.items.push(item._id);
      await inventory.save();

      res.status(201).json({
        message: 'Item created successfully and added to inventory',
        item,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
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

      // Validate item type
      if (updates.type && !['Breakable', 'Refrigerant', 'Normal'].includes(updates.type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }

      // Upload image if provided
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        updates.image = uploadResult.secure_url;
        await fs.promises.unlink(req.file.path); // Delete temp file
      }

      // Find the item
      const item = await Item.findById(id);
      if (!item) return res.status(404).json({ error: 'Item not found' });

      // Update fields
      Object.keys(updates).forEach((key) => {
        item[key] = updates[key];
      });

      // Update itemStatus based on quantity
      if (item.quantity === 0) {
        item.itemStatus = 'outOfStock';
      } else {
        item.itemStatus = 'inStock';
      }

      // Save the updated item
      await item.save();

      res.status(200).json({
        message: 'Item updated successfully',
        item,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Update SDK
exports.updateSDK = async (req, res) => {
  try {
    const { id } = req.params;
    const { SDK } = req.body;

    if (!SDK || typeof SDK !== 'string') {
      return res.status(400).json({ error: 'SDK must be a non-empty string' });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.SDK = SDK;
    await item.save();

    res.status(200).json({ message: 'SDK updated successfully', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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