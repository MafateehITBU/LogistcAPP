const Order = require('../models/Order');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const UserItems = require('../models/userItems');
const asyncHandler = require('express-async-handler');
const FulltimeCaptain = require('../models/FulltimeCaptain');
const FreelanceCaptain = require('../models/FreelanceCaptain');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
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

// Helper: Update the wallet balance when credit or debit is updated
const updateWalletBalance = asyncHandler(async (walletId, amount, transactionType) => {
    try {
        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            throw new Error("Wallet not found");
        }

        // Update wallet balance based on transaction type
        wallet.balance = transactionType === "credit" ? wallet.balance + amount : wallet.balance - amount;
        await wallet.save();
    } catch (error) {
        console.error("Error updating wallet balance:", error.message);
    }
});

// Helper : Move current transaction to history and update
const moveTransactionToHistory = async (transaction, amount, orderId, walletId, type) => {
    try {
        transaction.transactionHistory.push({
            amount: transaction.amount,
            orderId: transaction.orderId,
            description: transaction.description,
            paid: transaction.paid,
            timestamp: transaction.updatedAt // Store timestamp of the previous transaction
        });

        // Update the existing transaction with new data
        transaction.amount = amount;
        transaction.orderId = orderId;
        transaction.paid = false;

        await transaction.save();
        await updateWalletBalance(walletId, amount, type);
    } catch (err) {
        console.error("Error moving transaction to history:", err.message);
    }
};

// Helper: Create a new transaction
const createTransaction = async (type, amount, orderId, walletId) => {
    try {
        const newTransaction = new Transaction({
            walletId,
            amount,
            orderId,
            type,
            transactionHistory: [] // Empty history initially
        });

        await newTransaction.save();
        await updateWalletBalance(walletId, amount, type);
    } catch (err) {
        console.error("Error creating transaction:", err.message);
    }
};

// Helper: Handle user balance (in wallet) based on order status
const handleUserBalance = async (order, user) => {
    try {
        const walletId = user.walletNo;
        if (!walletId) console.log("User wallet not found");

        const wallet = await Wallet.findById(walletId);
        if (!wallet) console.log("Wallet not found");

        const { paymentStatus } = order;
        const deliveryFee = 3;
        let amount, type;

        switch (paymentStatus) {
            case "Paid":
                amount = deliveryFee;
                type = "debit";
                break;
            case "Unpaid":
                amount = order.totalPrice - deliveryFee;
                type = "credit";
                break;
            default:
                return;
        }

        let transaction = await Transaction.findOne({ walletId, type });
        if (transaction) {
            await moveTransactionToHistory(transaction, amount, order._id, walletId, type);
        } else {
            await createTransaction(type, amount, order._id, walletId);
        }
    } catch (err) {
        console.error("Error handling user balance:", err.message);
    }
};

// Helper: Handle captains balance
const handleCaptainBalance = async (order, captain, captainModel) => {
    try {
        console.log("in the function of captain balance");
        const walletId = captain.walletNo;
        if (!walletId) {
            console.log("Captain wallet not found");
            return;
        }
        console.log("WalletID: " + walletId);

        let wallet = await Wallet.findById(walletId);
        if (!wallet) {
            console.log("Wallet not found");
            return;
        }

        console.log("Wallet before transaction: ", wallet);

        const { paymentStatus, status, totalPrice } = order;
        const delivery = 3;
        console.log("Order info: ", order);

        // Transactions for each case
        const transactionCases = {
            FulltimeCaptain: {
                OutToDelivery: {
                    Unpaid: [{ amount: totalPrice, type: "debit" }],
                },
                Refused: {
                    Unpaid: [{ amount: order.totalPrice, type: "debit" }],
                },
                Partially: {
                    Unpaid: [{ amount: order.totalPrice, type: "debit" }],
                }
            },
            FreelanceCaptain: {
                OutToDelivery: {
                    Paid: [{ amount: 1, type: "credit" }],
                    Unpaid: [
                        { amount: totalPrice , type: "debit" },
                        { amount: 1, type: "credit" },
                    ],
                },
                Refused: {
                    Paid: [{ amount: 1, type: "credit" }],
                    Unpaid: [
                        { amount: order.totalPrice, type: "debit" },
                        { amount: 1, type: "credit" },
                    ],
                },
                Partially: {
                    Paid: [{ amount: 1, type: "credit" }],
                    Unpaid: [
                        { amount: order.totalPrice, type: "debit" },
                        { amount: 1, type: "credit" },
                    ],
                }
            },
        };

        let transactions;

        if (order.refusal.type === "Partially") {
            transactions = (transactionCases[captainModel] &&
                transactionCases[captainModel]["Partially"] &&
                transactionCases[captainModel]["Partially"][paymentStatus]) || [];
        } else {
            transactions = (transactionCases[captainModel] &&
                transactionCases[captainModel][status] &&
                transactionCases[captainModel][status][paymentStatus]) || [];
        }

        console.log("Transactions to be made:", JSON.stringify(transactions, null, 2));

        for (const { amount, type } of transactions) {
            if (order.refusal.type === "Partially") {
                // Fetch the existing transaction
                const existingTransaction = await Transaction.findOne({ walletId, orderId: order._id, type });

                if (existingTransaction) {
                    console.log(`Updating existing transaction: ${existingTransaction._id}`);

                    // Recalculate the balance
                    let oldAmount = existingTransaction.amount;
                    let newAmount = amount;
                    let balanceChange = oldAmount - newAmount;

                    // Update the wallet balance
                    if (type === "debit") {
                        wallet.balance += (balanceChange);
                    } else {
                        wallet.balance -= balanceChange;
                    }

                    // Update the transaction amount
                    existingTransaction.amount = newAmount;
                    await existingTransaction.save();
                } else {
                    console.log("No existing transaction found. Creating new transaction...");
                    await createTransaction(type, amount, order._id, walletId);

                    // Adjust the wallet balance for the new transaction
                    if (type === "debit") {
                        wallet.balance -= amount;
                    } else {
                        wallet.balance += amount;
                    }
                }
            } else {
                // Normal transaction handling
                let transaction = await Transaction.findOne({ walletId, type });
                if (transaction) {
                    await moveTransactionToHistory(transaction, amount, order._id, walletId, type);
                } else {
                    await createTransaction(type, amount, order._id, walletId);
                }
            }
        }

        // Save updated wallet balance
        await wallet.save();
        console.log("Updated Wallet Balance:", wallet.balance);
    } catch (err) {
        console.log("Error handling captain balance: ", err);
    }
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

//Create Order : User Order Creation
const createOrder = asyncHandler(async (req, res) => {
    try {
        const {
            items,
            city,
            district,
            area,
            street,
            orderType = 'Normal',
            preferredTime,
            paymentStatus,
            status = 'Pending',
            postponedDate
        } = req.body;

        // Validate orderType
        if (!['Normal', 'Fast'].includes(orderType)) {
            return res.status(400).json({ message: 'Invalid order type. Allowed values: Normal, Fast' });
        }

        // Validate status
        if (!['Pending', 'InStore', 'OutToDelivery', 'Delivered', 'Refused', 'Postponed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid order status.' });
        }

        // If order is postponed, postponedDate must be provided
        if (status === 'Postponed' && !postponedDate) {
            return res.status(400).json({ message: 'Postponed orders must have a postponedDate.' });
        }

        // Extract userId from the authenticated user
        const userId = req.user._id;

        // Validate user
        const user = await validateUser(userId);

        // Validate items and calculate total price
        const totalPrice = await validateItems(items, user);

        // Determine points based on city
        const pointsToAdd = city.toLowerCase() === 'amman' ? 1 : 3;

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
            status,
            orderType,
            paymentStatus,
            preferredTime,
            postponedDate: status === 'Postponed' ? postponedDate : null
        });

        // Save the order
        const createdOrder = await order.save();

        // Add order reference to the user's orders array
        user.orders.push(order._id);

        // Increase user points
        user.points += pointsToAdd;

        // Save updated user
        await user.save();

        // modify the balance in the users wallet
        await handleUserBalance(createdOrder, user);

        // Emit a notification for the new order
        req.io.emit("newOrder", {
            message: `New order received`,
            createdAt: order.createdAt,
            orderType: order.orderType,
        });

        res.status(201).json({
            message: 'Order created successfully',
            order,
            pointsAdded: pointsToAdd,
            totalPoints: user.points
        });
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(400).json({ message: error.message });
    }
});

const editOrderDetails = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        const { city, district, area, street, items, orderType, postponedDate, status, paymentStatus, preferredTime } = req.body;
        const userId = req.user._id;

        // Fetch the order and ensure it belongs to the authenticated user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.user.equals(userId)) {
            return res.status(403).json({ message: 'You are not authorized to edit this order' });
        }

        // Allow edits only if the status is 'Pending' or if updating to 'Postponed'
        if (order.status !== 'Pending' && !(status === 'Postponed' && order.status !== 'Delivered')) {
            return res.status(400).json({ message: 'You can only edit pending orders or update status to postponed' });
        }

        // Update allowed fields
        if (city) order.city = city;
        if (district) order.district = district;
        if (area) order.area = area;
        if (street) order.street = street;
        if (orderType) order.orderType = orderType;
        if (preferredTime) order.preferredTime = preferredTime;

        // Handle postponed status and date validation
        if (status === 'Postponed') {
            if (!postponedDate) {
                return res.status(400).json({ message: 'Postponed date is required when postponing an order' });
            }
            order.status = 'Postponed';
            order.postponedDate = postponedDate;
        }

        // Handle payment status update
        if (paymentStatus) {
            if (!['Unpaid', 'Paid'].includes(paymentStatus)) {
                return res.status(400).json({ message: 'Invalid payment status' });
            }
            order.paymentStatus = paymentStatus;
        }

        // Handle items if provided
        if (items && Array.isArray(items)) {
            order.items = items.map(({ itemId, quantity, source }) => ({
                item: itemId,
                quantity,
                source,
            }));
        }

        // Save the updated order and recalculate totalPrice via pre-save middleware
        await order.save();

        res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error.message);
        res.status(400).json({ message: error.message });
    }
});

//Assign Order to Captains
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

// Helper: Check date for order history
const checkDateForOrderHistory = async (orderCountHistory, captain) => {
    const date = new Date("2025-1-1");
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11 (January = 0, December = 11)
    const day = date.getDate();

    // Check if today is the 1st day of the month
    if (day === 1) {
        // Find the history entry for the previous month in the order count history
        let history = orderCountHistory.find((history) => history.year === year);

        if (!history) {
            // If no history exists for this year, create one
            history = { year: year, months: {} };
            orderCountHistory.push(history);
        }

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];

        // Add ordersCount to the appropriate month (previous month)
        const prevMonthName = monthNames[month === 0 ? 11 : month - 1]; // Handle January (index 0) to December (index 11)
        if (prevMonthName === "December") {
            prevHistory = { year: year - 1, months: {} };
            orderCountHistory.push(prevHistory);
            prevHistory.months.prevMonthName = captain.ordersCount;
        } else {
            history.months.prevMonthName = (history.months[prevMonthName] || 0) + captain.ordersCount;
        }

        // Reset ordersCount to 0 after transferring it to the history
        captain.ordersCount = 0;
        // await captain.save();
    }
};

//Change Status for Admins (inStore , OutFor Delevery)
const changeOrderStatusAdmin = async (req, res) => {
    try {
        const { orderId } = req.params; // Get order ID from URL params
        const { status } = req.body; // Get new status from request body

        // Allowed status updates for Admin
        const allowedStatuses = ['InStore', 'OutToDelivery'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Admin can only change status to ${allowedStatuses.join(', ')}`
            });
        }

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (status === "InStore") {
            let captain = await FulltimeCaptain.findById(order.procurementOfficer);
            if (!captain) {
                return res.status(404).json({ message: 'Captain not found' });
            }
            if (typeof checkDateForOrderHistory === "function") {
                checkDateForOrderHistory(captain.orderCountHistory, captain);
            }
            captain.ordersCount = (captain.ordersCount || 0) + 1;
            await captain.save();
        }

        if (status === 'OutToDelivery') {
            if (!order.deliveryCaptain) {
                return res.status(400).json({ message: 'Delivery captain is missing' });
            }

            let captain = await FulltimeCaptain.findById(order.deliveryCaptain);
            let captainModel = 'FulltimeCaptain';

            if (!captain) {
                captain = await FreelanceCaptain.findById(order.deliveryCaptain);
                captainModel = 'FreelanceCaptain';
            }

            if (!captain) {
                return res.status(404).json({ message: 'Captain not found' });
            }

            await handleCaptainBalance(order, captain, captainModel);
        }

        // Update the status
        order.status = status;
        await order.save();

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error("Error changing order status:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
const changeOrderStatusByCaptain = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, refusalType, notes, updatedItems, postponedDate } = req.body;

        const allowedStatuses = ['Delivered', 'Refused', 'Postponed'];
        const allowedRefusalTypes = ['NoResponse', 'Wrong Location', 'Partially', 'Ignore'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Captain can only set status to Delivered, Refused, or Postponed.`,
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (status === 'Refused') {
            if (!allowedRefusalTypes.includes(refusalType)) {
                return res.status(400).json({
                    message: `Invalid refusal reason. Allowed values: ${allowedRefusalTypes.join(', ')}`,
                });
            }
            order.refusal.type = refusalType;
            order.refusal.description = notes || ''; // Store notes inside `refusal.description`
        }

        if (status === 'Refused' && refusalType === 'Partially') {
            if (!updatedItems || !Array.isArray(updatedItems)) {
                return res.status(400).json({ message: 'For partial refusal, updatedItems array is required' });
            }
            order.items = updatedItems;
        }

        if (status === 'Postponed') {
            if (!postponedDate) {
                return res.status(400).json({ message: 'Postponed date is required when postponing an order' });
            }
            order.postponedDate = postponedDate;
        }

        if (status === 'Delivered') {
            let captain = await FulltimeCaptain.findById(order.deliveryCaptain);
            if (captain) {
                // Update captain's orders
                checkDateForOrderHistory(captain.orderCountHistory, captain);
                captain.ordersCount = (captain.ordersCount || 0) + 1;
                await captain.save();
            }
        }

        order.status = status;
        await order.save();

        if (status === 'Refused' && refusalType === 'Partially') {
            const captain = await (order.deliveryCaptainModel === "FreelanceCaptain" ?
                FreelanceCaptain.findById(order.deliveryCaptain)
                : FulltimeCaptain.findById(order.deliveryCaptain));

            console.log("captain: ", captain);

            await handleCaptainBalance(order, captain, order.
                deliveryCaptainModel);
        }

        res.status(200).json({
            message: 'Order status updated successfully by captain',
            order,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// Export all controller functions
module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    editOrderDetails,
    assignCaptains,
    changeOrderStatusAdmin,
    changeOrderStatusByCaptain,
};
