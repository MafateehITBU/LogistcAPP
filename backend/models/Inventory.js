const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema ({
    item_id:[{type: mongoose.Schema.Types.ObjectId, ref:'Item'}],
    productStatus: {
        type: String,
        enum: ['instock', 'outOfStock'],
        default: 'instock'
    }
}, { timestamps: true })

module.exports = mongoose.model('Inventory', inventorySchema);