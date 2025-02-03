const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    balance: { type: Number, required: true, default: 0 },
    dues: { type: Number, required: true, default: 0 },
    revenues: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);