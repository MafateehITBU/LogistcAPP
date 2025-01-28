const Order = require('../models/Order');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const UserItems = require('../models/userItems');
const asyncHandler = require('express-async-handler');

// Helper: Validate user by userId
const validateUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

// Helper: Validate items and calculate total price
const validateItems = async (items, user) => {
    let totalPrice = 0;

    for (const item of items) {
        const { itemId, quantity, source } = item;

        if (source === 'InventoryItem') {
            // Check if user has 'partner' role for inventory items
            if (user.role !== 'partner') {
                throw new Error('Only partners can add items from inventory');
            }

            const inventoryItem = await InventoryItem.findById(itemId);
            if (!inventoryItem) {
                throw new Error(`Inventory item with ID ${itemId} not found`);
            }
            if (inventoryItem.quantity < quantity) {
                throw new Error(`Insufficient quantity for item ${inventoryItem.name}`);
            }

            totalPrice += inventoryItem.price * quantity; // Add price once
        } else if (source === 'UserItems') {
            const userItem = await UserItems.findById(itemId);
            if (!userItem || String(userItem.ownerId) !== String(user._id)) {
                throw new Error(`User item with ID ${itemId} not found or doesn't belong to user`);
            }
            if (userItem.quantity < quantity) {
                throw new Error(`Insufficient quantity for item ${userItem.name}`);
            }

            totalPrice += userItem.price * quantity; // Add price once
        } else {
            throw new Error('Invalid source specified for an item');
        }
    }

    return totalPrice;
};

// Helper: Update inventory or user item quantities
const updateItemQuantities = async (items) => {
    for (const item of items) {
        const { itemId, quantity, source } = item;

        if (source === 'InventoryItem') {
            const inventoryItem = await InventoryItem.findById(itemId);
            if (inventoryItem) {
                // Check sufficient quantity before decrement
                if (inventoryItem.quantity < quantity) {
                    throw new Error(`Insufficient quantity for item ${inventoryItem.name}`);
                }
                inventoryItem.quantity -= quantity; // Deduct only once
                await inventoryItem.save();
            }
        } else if (source === 'UserItems') {
            const userItem = await UserItems.findById(itemId);
            if (userItem) {
                // Check sufficient quantity before decrement
                if (userItem.quantity < quantity) {
                    throw new Error(`Insufficient quantity for item ${userItem.name}`);
                }
                userItem.quantity -= quantity; // Deduct only once
                await userItem.save();
            }
        }
    }
};



const createOrder = asyncHandler(async (req, res) => {
    try {
        const { items, city, district, area, street } = req.body;

        // Extract userId from the authenticated user
        const userId = req.user._id;

        // Validate user
        const user = await validateUser(userId);

        // Validate items and calculate total price
        const totalPrice = await validateItems(items, user);

        // Create the order
        const order = new Order({
            user: userId,
            items: items.map(({ itemId, quantity, source }) => ({
                item: itemId,
                quantity,
                source,
            })),
            city,
            district,
            area,
            street,
            totalPrice,
            status: 'Pending',
        });

        // Save the order
        await order.save();

        // Add order reference to the user's orders array
        user.orders.push(order._id);
        await user.save();

     

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error.message); // Log for debugging
        res.status(400).json({ message: error.message });
    }
});


// Controller: Get Orders by User
const getUserOrders = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch orders by the authenticated user
        const orders = await Order.find({ user: userId }).populate('items.item');

        res.status(200).json({ orders });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Controller: Get All Orders (Admin)
const getAllOrders = asyncHandler(async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Fetch all orders
        const orders = await Order.find().populate('items.item').populate('user', 'name email');

        res.status(200).json({ orders });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Controller: Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Validate order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status
        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Export all controller functions
module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
};
