const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');
const UserItems = require('../models/userItems');
const User = require('../models/User');
const FulltimeCaptain = require('../models/FulltimeCaptain');

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // The user who placed the order
    items: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: 'items.source' // Dynamically reference either InventoryItem or UserItems
            },
            source: { 
                type: String, 
                required: true, 
                enum: ['InventoryItem', 'UserItems'] 
            },
            quantity: { 
                type: Number, 
                required: true 
            }
        }
    ],
    city: { 
        type: String, 
        required: true, 
        enum: ['Amman', 'Irbid', 'Zarqa', 'Mafraq', 'Jerash', 'Ajloun', 'Madaba', 'Karak', 'Tafilah', 'Ma’an', 'Aqaba']
    }, // All Jordan cities
    district: { 
        type: String, 
        enum: ['Naaour', 'Wadi-Alseer', 'Marka', 'Al-Gezza', 'Sahab', 'Qwesmeh', 'Mwaqar', 'AL-Jamma', 'AL-Qasaba'] 
    }, // Optional
    area: { 
        type: String, 
        required: true 
    },
    street: { 
        type: String, 
        required: true 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    }, // Calculated based on items
    status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'InStore', 'OutToDelivery', 'Delivered', 'Refused'], 
        default: 'Pending' 
    },
    refusal: {
        description: { type: String },
        type: { 
            type: String, 
            enum: ['NoResponse', 'Wrong Location', 'Partially', 'Ignore'] 
        }
    }, // Only applicable if the status is "Refused"
    procurementOfficer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FulltimeCaptain' 
    }, // Assigned to a procurement staff member
    deliveryCaptain: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FulltimeCaptain' 
    } // Assigned to a delivery staff member
}, { timestamps: true });

// Pre-save middleware to calculate totalPrice and update inventory quantities
orderSchema.pre('save', async function (next) {
    try {
        let total = 0;
        for (const item of this.items) {
            if (item.source === 'InventoryItem') {
                const inventoryItem = await InventoryItem.findById(item.item);
                if (!inventoryItem) throw new Error('Inventory item not found');
                if (inventoryItem.quantity < item.quantity) throw new Error('Not enough inventory quantity');
                inventoryItem.quantity -= item.quantity; // Decrease inventory quantity
                await inventoryItem.save();
                total += inventoryItem.price * item.quantity;
            } else if (item.source === 'UserItems') {
                const userItem = await UserItems.findById(item.item);
                if (!userItem) throw new Error('User item not found');
                if (userItem.quantity < item.quantity) throw new Error('Not enough user item quantity');
                userItem.quantity -= item.quantity; // Decrease user item quantity
                await userItem.save();
                total += userItem.price * item.quantity;
            }
        }
        this.totalPrice = total; // Set the total price for the order
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Order', orderSchema);
