const User = require('../models/user');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
    const { name, email, password, phone, role, orders, points, walletNo, shift } = req.body;
  
    try {
      // Validate required fields
      if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
      }
  
      // Create a new user
      const newUser = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'user',
        orders: orders || [], 
        points: points || 0, 
        walletNo,
        shift,
      });
  
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      // Handle duplicate email or other validation errors
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      res.status(400).json({ message: error.message });
    }
  };
  
