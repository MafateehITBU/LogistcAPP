const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema ({
    productName: {
        type: String,
        required: true
    },
    productOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productQuantity: {
        type: String,
        required: true
    },
    productPrice: {
        type: String,
        required: true
    },
    productPicture: {
        type: String,
        required: true
    }, 
    productStatus: {
        type: String,
        enum: ['instock', 'outOfStock'],
        default: 'instock'
    },
    productType:{
        type:String,
        enum: ['fragile', 'refrigrated', 'regular'],
        default: 'regular'
    }
}, { timestamps: true })

module.exports = mongoose.model('Inventory', inventorySchema);