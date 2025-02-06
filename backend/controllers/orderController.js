const Order = require('../models/Order');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const UserItems = require('../models/userItems');
const asyncHandler = require('express-async-handler');
const FulltimeCaptain = require('../models/FulltimeCaptain');
const FreelanceCaptain = require('../models/FreelanceCaptain');
const mongoose = require('mongoose');

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
        // Fetch all orders
        const orders = await Order.find()
            .populate('items.item') // Populate the item details
            .populate('user', 'name email'); // Populate the user details with name and email

        res.status(200).json({ orders });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//create new order : User
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
//Edit Order User
const editOrderDetails = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        const { city, district, area, street, items } = req.body;
        const userId = req.user._id;

        // Fetch the order and ensure it belongs to the authenticated user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.user.equals(userId)) {
            return res.status(403).json({ message: 'You are not authorized to edit this order' });
        }

        // Allow edits only if the status is 'Pending'
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'You can only edit orders that are pending' });
        }

        // Update allowed fields
        if (city) order.city = city;
        if (district) order.district = district;
        if (area) order.area = area;
        if (street) order.street = street;

        // Handle items if provided
        if (items && Array.isArray(items)) {
            order.items = items.map(({ itemId, quantity, source }) => ({
                item: itemId,
                quantity,
                source,
            }));
        }

        // Recalculate totalPrice using the pre-save middleware
        await order.save();

        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error.message);
        res.status(400).json({ message: error.message });
    }
});

const assignCaptains = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { procurementOfficer, deliveryCaptain } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Assign Procurement Officer (Must be a FulltimeCaptain)
        if (procurementOfficer) {
            if (!mongoose.Types.ObjectId.isValid(procurementOfficer)) {
                return res.status(400).json({ message: 'Invalid procurement officer ID' });
            }

            const procurementOfficerData = await FulltimeCaptain.findById(procurementOfficer);
            if (!procurementOfficerData) {
                return res.status(404).json({ message: 'Procurement officer not found' });
            }

            order.procurementOfficer = procurementOfficer;
        }

        // Assign Delivery Captain (Check in both FulltimeCaptain and FreelanceCaptain)
        if (deliveryCaptain) {
            if (!mongoose.Types.ObjectId.isValid(deliveryCaptain)) {
                return res.status(400).json({ message: 'Invalid delivery captain ID' });
            }

            let captain = await FulltimeCaptain.findById(deliveryCaptain);
            let captainModel = 'FulltimeCaptain';

            if (!captain) {
                captain = await FreelanceCaptain.findById(deliveryCaptain);
                captainModel = 'FreelanceCaptain';
            }

            if (!captain) {
                return res.status(404).json({ message: 'Delivery captain not found' });
            }

            order.deliveryCaptain = deliveryCaptain;
            order.deliveryCaptainModel = captainModel;
        }

        await order.save();
        return res.status(200).json({ message: 'Captains assigned successfully', order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};





// Export all controller functions
module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    editOrderDetails,
    assignCaptains,
};
