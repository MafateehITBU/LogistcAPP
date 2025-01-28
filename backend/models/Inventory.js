const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema ({
    items:[{type: mongoose.Schema.Types.ObjectId, ref:'InventoryItem'}],
}, { timestamps: true })

module.exports = mongoose.model('Inventory', inventorySchema);