const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false }, // Image URL from Cloudinary
    type: {
        type: String,
        required: true,
        enum: ['Breakable', 'Refrigerant', 'Normal']
    },
    expireDate: { type: Date, required: false }, // Optional
    weight: { type: Number, required: true }, // Weight in KG
    height: { type: Number, required: true }, // Height in meters
    width: { type: Number, required: true }, // Width in meters
    length: { type: Number, required: true }, // Length in meters
    volume: { type: Number }, // Auto-calculated: height * width * length
    area: { type: Number }, // Auto-calculated: width * length
    distance: { type: Number, required: true }, // Distance in KM
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    SKU: {
        type: String,
        default: ' ',
    },
    itemStatus: {
        type: String,
        enum: ['inStock', 'outOfStock'],
        default: 'inStock',
    },
}, { timestamps: true });

// Pre-save middleware to calculate volume and area
inventoryItemSchema.pre('save', function (next) {
    this.volume = this.height * this.width * this.length; // Volume in cubic meters
    this.area = this.width * this.length; // Area in square meters
    next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);