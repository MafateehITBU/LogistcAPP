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
                refPath: 'items.source' 
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
    },
    district: { 
        type: String, 
        enum: ['Naaour', 'Wadi-Alseer', 'Marka', 'Al-Gezza', 'Sahab', 'Qwesmeh', 'Mwaqar', 'AL-Jamma', 'AL-Qasaba'] 
    },
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
    },
    status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'InStore', 'OutToDelivery', 'Delivered', 'Refused'], 
        default: 'Pending' 
    },
    orderType: { 
        type: String, 
        required: true, 
        enum: ['Normal', 'Fast'], 
        default: 'Normal' 
    }, // New order type field
    refusal: {
        description: { type: String },
        type: { 
            type: String, 
            enum: ['NoResponse', 'Wrong Location', 'Partially', 'Ignore'] 
        }
    }, 
    notes: {
        type: String, 
        required: false
    },
    procurementOfficer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FulltimeCaptain',
        default: null
    },
    deliveryCaptain: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'deliveryCaptainModel',
        default: null
    },
    deliveryCaptainModel: {
        type: String,
        enum: ['FulltimeCaptain', 'FreelanceCaptain'],
        default: null
    }
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
    try {
        let total = 0;

        if (this.isNew) {
            for (const item of this.items) {
                if (item.source === 'InventoryItem') {
                    const inventoryItem = await InventoryItem.findById(item.item);
                    if (!inventoryItem) throw new Error('Inventory item not found');
                    if (inventoryItem.quantity < item.quantity) throw new Error('Not enough inventory quantity');
                    inventoryItem.quantity -= item.quantity;
                    await inventoryItem.save();
                    total += inventoryItem.price * item.quantity;
                } else if (item.source === 'UserItems') {
                    const userItem = await UserItems.findById(item.item);
                    if (!userItem) throw new Error('User item not found');
                    if (userItem.quantity < item.quantity) throw new Error('Not enough user item quantity');
                    userItem.quantity -= item.quantity;
                    await userItem.save();
                    total += userItem.price * item.quantity;
                }
            }
        } else if (this.isModified('items')) {
            const existingOrder = await mongoose.model('Order').findById(this._id).lean();

            for (const oldItem of existingOrder.items) {
                if (oldItem.source === 'InventoryItem') {
                    const inventoryItem = await InventoryItem.findById(oldItem.item);
                    if (inventoryItem) {
                        inventoryItem.quantity += oldItem.quantity;
                        await inventoryItem.save();
                    }
                } else if (oldItem.source === 'UserItems') {
                    const userItem = await UserItems.findById(oldItem.item);
                    if (userItem) {
                        userItem.quantity += oldItem.quantity;
                        await userItem.save();
                    }
                }
            }

            for (const newItem of this.items) {
                if (newItem.source === 'InventoryItem') {
                    const inventoryItem = await InventoryItem.findById(newItem.item);
                    if (!inventoryItem) throw new Error('Inventory item not found');
                    if (inventoryItem.quantity < newItem.quantity) throw new Error('Not enough inventory quantity');
                    inventoryItem.quantity -= newItem.quantity;
                    await inventoryItem.save();
                    total += inventoryItem.price * newItem.quantity;
                } else if (newItem.source === 'UserItems') {
                    const userItem = await UserItems.findById(newItem.item);
                    if (!userItem) throw new Error('User item not found');
                    if (userItem.quantity < newItem.quantity) throw new Error('Not enough user item quantity');
                    userItem.quantity -= newItem.quantity;
                    await userItem.save();
                    total += userItem.price * newItem.quantity;
                }
            }
        } else {
            total = this.totalPrice;
        }

        this.totalPrice = total;
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Order', orderSchema);
