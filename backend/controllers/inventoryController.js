const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

exports.getAllInventories = asyncHandler(async (req, res) => {
    try {
        // Fetch all inventories and populate the items
        const inventories = await Inventory.find()
            .populate('items')
            .lean(); // Convert documents to plain JavaScript objects

        // If no inventories are found
        if (!inventories || inventories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No inventories found',
            });
        }

        // Map through inventories and attach user info
        const inventoriesWithUsers = await Promise.all(
            inventories.map(async (inventory) => {
                // Find the user associated with this inventory
                const user = await User.findOne({ inventory: inventory._id }).select('name');
                return {
                    ...inventory, // Include inventory data
                    userName: user ? user.name : 'Unknown',
                };
            })
        );

        res.status(200).json(inventoriesWithUsers);
    } catch (error) {
        // Logging the error for debugging
        console.error('Error fetching inventories:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventories',
            error: error.message,
        });
    }
});

// Get a single inventory by ID controller
exports.getInventory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.findById(id).populate('items');

        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found' });
        }

        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete inventory and remove its reference from the user
exports.deleteInventory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.findById(id);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventory not found',
            });
        }

        // Remove the inventory ID from the user's document
        const user = await User.findOneAndUpdate(
            { inventory: id },
            { $unset: { inventory: "" } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or inventory reference not found in user',
            });
        }

        await Inventory.findByIdAndDelete(id);

        res.status(200).json({ message: 'Inventory and user reference deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get user inventory
exports.getUserInventory = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user and populate their inventory and its items
        const user = await User.findById(userId).populate({
            path: 'inventory',
            populate: {
                path: 'items', // Populate the items within the inventory
            },
        });

        // Check if user or inventory exists
        if (!user || !user.inventory) {
            return res.status(404).json({
                success: false,
                message: 'User or inventory not found',
            });
        }

        // Return the inventory along with the populated items
        res.status(200).json(user.inventory);
    } catch (error) {
        console.error('Error fetching user inventory:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user inventory',
            error: error.message,
        });
    }
});

