// middleware/expenseAuth.js
const User = require('../models/User');

// Middleware to check if user is authorized to manage expenses (Admin or Treasurer)
const expenseAuth = async (req, res, next) => {
  try {
    // Check if user exists and is Admin or Treasurer
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'Admin' || user.role === 'Treasurer') {
      // User is authorized, proceed
      next();
    } else {
      // User is not authorized
      return res.status(403).json({ message: 'Access denied. Only Admin or Treasurer can perform this action.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = expenseAuth;