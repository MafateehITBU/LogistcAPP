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
        // Fetch all orders
        const orders = await Order.find()
            .populate('items.item') // Populate the item details
            .populate('user', 'name email'); // Populate the user details with name and email

        res.status(200).json({ orders });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




const updateOrderDetails = asyncHandler(async (req, res) => {
    try {
        const { id: orderId } = req.params; // Get the order ID from the request parameters
        const updateFields = { ...req.body }; // Copy the request body for updates

        // Restricted fields: Users are not allowed to update these
        delete updateFields.procurementOfficer;
        delete updateFields.deliveryCaptain;

        // Find the order
        const order = await Order.findById(orderId).populate('items.item');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure the user owns this order
        if (String(order.user) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to update this order' });
        }

        // Handle quantity updates
        if (updateFields.items) {
            // Track the new items and updated quantities
            const updatedItems = updateFields.items;

            // Loop through the existing items in the order
            for (const existingItem of order.items) {
                const updatedItem = updatedItems.find(
                    (item) => String(item.item) === String(existingItem.item._id) && item.source === existingItem.source
                );

                if (updatedItem) {
                    // Calculate quantity difference
                    const quantityDifference = updatedItem.quantity - existingItem.quantity;

                    // Adjust inventory based on the difference
                    if (updatedItem.source === 'InventoryItem') {
                        const inventoryItem = await InventoryItem.findById(existingItem.item._id);
                        if (!inventoryItem) throw new Error('Inventory item not found');
                        if (inventoryItem.quantity < quantityDifference && quantityDifference > 0) {
                            throw new Error('Not enough inventory quantity');
                        }
                        inventoryItem.quantity -= quantityDifference; // Update inventory quantity
                        await inventoryItem.save();
                    } else if (updatedItem.source === 'UserItems') {
                        const userItem = await UserItems.findById(existingItem.item._id);
                        if (!userItem) throw new Error('User item not found');
                        if (userItem.quantity < quantityDifference && quantityDifference > 0) {
                            throw new Error('Not enough user item quantity');
                        }
                        userItem.quantity -= quantityDifference; // Update user item quantity
                        await userItem.save();
                    }

                    // Update the item's quantity in the order
                    existingItem.quantity = updatedItem.quantity;
                } else {
                    // Item removed from the order, restore inventory
                    if (existingItem.source === 'InventoryItem') {
                        const inventoryItem = await InventoryItem.findById(existingItem.item._id);
                        if (inventoryItem) {
                            inventoryItem.quantity += existingItem.quantity; // Restore inventory quantity
                            await inventoryItem.save();
                        }
                    } else if (existingItem.source === 'UserItems') {
                        const userItem = await UserItems.findById(existingItem.item._id);
                        if (userItem) {
                            userItem.quantity += existingItem.quantity; // Restore user item quantity
                            await userItem.save();
                        }
                    }
                }
            }

            // Add new items to the order
            for (const updatedItem of updatedItems) {
                const existingItem = order.items.find(
                    (item) => String(item.item._id) === String(updatedItem.item) && item.source === updatedItem.source
                );

                if (!existingItem) {
                    // New item added
                    if (updatedItem.source === 'InventoryItem') {
                        const inventoryItem = await InventoryItem.findById(updatedItem.item);
                        if (!inventoryItem) throw new Error('Inventory item not found');
                        if (inventoryItem.quantity < updatedItem.quantity) {
                            throw new Error('Not enough inventory quantity');
                        }
                        inventoryItem.quantity -= updatedItem.quantity; // Deduct inventory quantity
                        await inventoryItem.save();
                    } else if (updatedItem.source === 'UserItems') {
                        const userItem = await UserItems.findById(updatedItem.item);
                        if (!userItem) throw new Error('User item not found');
                        if (userItem.quantity < updatedItem.quantity) {
                            throw new Error('Not enough user item quantity');
                        }
                        userItem.quantity -= updatedItem.quantity; // Deduct user item quantity
                        await userItem.save();
                    }

                    // Add the new item to the order
                    order.items.push(updatedItem);
                }
            }
        }

        // Update other fields (excluding items)
        for (const key in updateFields) {
            if (key !== 'items' && updateFields.hasOwnProperty(key)) {
                order[key] = updateFields[key];
            }
        }

        // Save the updated order
        await order.save();

        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




// Export all controller functions
module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderDetails,
};
