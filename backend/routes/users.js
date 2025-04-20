// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, mobileNumber, password, villageName, role } = req.body;
    
    // Check if mobile number already exists
    let user = await User.findOne({ mobileNumber });
    if (user) {
      return res.status(400).json({ message: 'User with this mobile number already exists' });
    }
    
    // Check if role is unique (Pradhan, Secretary, Treasurer)
    if (['Pradhan', 'Up Pradhan', 'Secretary', 'Treasurer', 'Chief Advisor',].includes(role)) {
      const existingRoleUser = await User.findOne({ role });
      if (existingRoleUser) {
        return res.status(400).json({ message: `A ${role} already exists` });
      }
    }
    
    user = new User({
      name,
      mobileNumber,
      password,
      villageName,
      role
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
        villageName: user.villageName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, mobileNumber, villageName, role } = req.body;
    
    // Find user by ID
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if mobile number already exists for another user
    if (mobileNumber !== user.mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this mobile number already exists' });
      }
    }
    
    // Check if role is unique (Pradhan, Secretary, Treasurer)
    if (['Pradhan', 'Secretary', 'Treasurer'].includes(role) && role !== user.role) {
      const existingRoleUser = await User.findOne({ role });
      if (existingRoleUser) {
        return res.status(400).json({ message: `A ${role} already exists` });
      }
    }
    
    // Update user
    user.name = name || user.name;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.villageName = villageName || user.villageName;
    user.role = role || user.role;
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ 
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
        villageName: user.villageName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
