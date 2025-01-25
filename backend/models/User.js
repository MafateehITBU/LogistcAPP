const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  points: { type: Number, default: 0 }, // Reward points
  walletNo: { type: String, required: false }, // Wallet number
  profilePicture: { type: String, required: false },
  age: { type: Number, required: true }, // Age of the user
  gender: { 
    type: String, 
    required: true, 
    enum: ['male', 'female'] // Restrict values to 'male' or 'female'
  },
  role: {
    type: String,
    required: true,
    enum: ['normal', 'partner']
  },
  inventory: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Inventory',
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
