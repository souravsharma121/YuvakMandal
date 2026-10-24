// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Timeout utility for operations
const withTimeout = (promise, timeMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeMs)
    )
  ]);
};

// Change password route
router.put('/reset-password', async (req, res) => {
  try {
    const {
      mobileNumber,
      newPassword
    } = req.body;

    const user = await User.findOne({
      mobileNumber
    });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const {
      mobileNumber, // This field now acts as "identifier" (email or mobile) from the frontend
      password
    } = req.body;

    if (!mobileNumber || !password) {
      return res.status(400).json({ message: 'Please provide both mobile/email and password' });
    }

    let user;
    const identifier = String(mobileNumber); // Ensure it's a string
    
    // Check if the input looks like an email
    const isEmail = identifier.includes('@');
    
    try {
      if (isEmail) {
        user = await withTimeout(User.findOne({ email: identifier }), 15000);
      } else {
        user = await withTimeout(User.findOne({ mobileNumber: identifier }), 15000);
      }
    } catch (timeoutErr) {
      console.error('Database timeout on login:', timeoutErr.message);
      return res.status(500).json({
        message: 'Login service temporarily unavailable. Please try again.'
      });
    }

    if (!user) {
      return res.status(400).json({
        message: 'Incorrect email or mobile number'
      });
    }

    // Check user active status
    if (user.isActive === 'No') {
        return res.status(403).json({
            message: 'Your account has been deactivated. Please contact admin.'
        });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Incorrect password'
      });
    }

    // Create JWT token
    const token = jwt.sign({
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET
    );


    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        role: user.role,
        villageName: user.villageName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    // Special handling for guest token
    if (req.user.userId === 'guest-user') {
      return res.json({
        _id: 'guest-user',
        name: 'Guest User',
        role: 'Guest',
        isGuest: true
      });
    }

    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;