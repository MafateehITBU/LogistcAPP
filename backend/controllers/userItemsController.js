const UserItems = require('../models/userItems');

// Get all items for the authenticated user
exports.getAllItems = async (req, res) => {
    try {
        const items = await UserItems.find({ ownerId: req.user._id });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch items', error: error.message });
    }
};

// Get a single item by ID
exports.getItem = async (req, res) => {
    const { id } = req.params;

    try {
        const item = await UserItems.findOne({ _id: id, ownerId: req.user._id });
        if (!item) {
            return res.status(404).json({ message: 'Item not found or not authorized' });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch item', error: error.message });
    }
};

// Create a new item
exports.createItem = async (req, res) => {
    const { name, quantity, price, image, type, expireDate, weight, height, width, length, distance, SKU } = req.body;

    try {
        // Check if an item with the same SKU exists
        const existingItem = await UserItems.findOne({ SKU, ownerId: req.user._id });

        if (existingItem) {
            // If it exists, increase the quantity
            existingItem.quantity += quantity;
            await existingItem.save();
            return res.status(200).json({ message: 'Item quantity updated successfully', item: existingItem });
        }

        // Create a new item
        const newItem = new UserItems({
            name,
            quantity,
            price,
            image,
            type,
            expireDate,
            weight,
            height,
            width,
            length,
            distance,
            ownerId: req.user._id,
            SKU,
        });

        await newItem.save();
        res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create item', error: error.message });
    }
};

// Update an item by ID
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const item = await UserItems.findOneAndUpdate(
            { _id: id, ownerId: req.user._id },
            updateData,
            { new: true }
        );

        if (!item) {
            return res.status(404).json({ message: 'Item not found or not authorized' });
        }

        res.status(200).json({ message: 'Item updated successfully', item });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update item', error: error.message });
    }
};

// Delete an item by ID
exports.deleteItem = async (req, res) => {
    const { id } = req.params;

    try {
        const item = await UserItems.findOneAndDelete({ _id: id, ownerId: req.user._id });

        if (!item) {
            return res.status(404).json({ message: 'Item not found or not authorized' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete item', error: error.message });
    }
};
