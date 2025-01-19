const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, 
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], 
  points: { type: Number, default: 0 }, // Reward points
  walletNo: { type: String, required: false }, // Wallet number
  shift: { type: String, enum: ['A', 'B', 'C'], required: false }, 
  profilePicture: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
