const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, 
  role: { type: String, enum: ['admin', 'user', 'delevery'], default: 'user' }, 
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], 
  points: { type: Number, default: 0 }, 
  walletNo: { type: String, required: false }, 
  shift: { type: String, enum: ['A', 'B', 'C'], required: false }, 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

