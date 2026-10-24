// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const adminAuth = require('../middleware/adminAuth');
const { sendEmail } = require('../utils/notificationService');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' }
});

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 8;

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const isValidPassword = (value) => typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH;
const findUserByEmail = (email) =>
  User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
const hashOtp = (userId, otp) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${userId}:${otp}`).digest('hex');

// Timeout utility for operations
const withTimeout = (promise, timeMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeMs)
    )
  ]);
};

// Admin sets a new password for any member
router.put('/admin/reset-password', auth, adminAuth, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword; // hashed by the User pre-save hook
    user.passwordChangedAt = new Date();
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email a 6-digit reset code (response is the same whether or not the account exists)
router.post('/forgot-password', authLimiter, async (req, res) => {
  const genericMessage = 'If an account with this email exists, a verification code has been sent.';

  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    const user = await findUserByEmail(email);

    if (user && user.isActive !== 'No') {
      const otp = crypto.randomInt(100000, 1000000).toString();

      await User.updateOne(
        { _id: user._id },
        {
          resetOtpHash: hashOtp(user._id, otp),
          resetOtpExpires: new Date(Date.now() + OTP_TTL_MS),
          resetOtpAttempts: 0
        }
      );

      try {
        await sendEmail(
          user.email,
          'Your password reset code',
          `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
          `<p>Your password reset code is <strong style="font-size:20px">${otp}</strong>.</p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`
        );
      } catch (mailErr) {
        console.error('Failed to send reset code:', mailErr.message);
      }
    }

    res.json({ message: genericMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify the emailed code and set a new password
router.post('/reset-password-otp', authLimiter, async (req, res) => {
  const invalidMessage = { message: 'Invalid or expired code' };

  try {
    const email = normalizeEmail(req.body.email);
    const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';
    const { newPassword } = req.body;

    if (!email || !/^\d{6}$/.test(otp) || !isValidPassword(newPassword)) {
      return res.status(400).json({
        message: `Enter your email, the 6-digit code and a password of at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    const user = await findUserByEmail(email);

    if (!user || !user.resetOtpHash || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json(invalidMessage);
    }

    if ((user.resetOtpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      return res.status(400).json({ message: 'Too many attempts. Please request a new code.' });
    }

    const expected = Buffer.from(user.resetOtpHash, 'hex');
    const actual = Buffer.from(hashOtp(user._id, otp), 'hex');
    const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

    if (!matches) {
      await User.updateOne({ _id: user._id }, { $inc: { resetOtpAttempts: 1 } });
      return res.status(400).json(invalidMessage);
    }

    user.password = newPassword; // hashed by the User pre-save hook
    user.passwordChangedAt = new Date();
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', authLimiter, async (req, res) => {
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
        message: 'Invalid credentials'
      });
    }


    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    if (user.isActive === 'No') {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Create JWT token
    const token = jwt.sign({
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1d' }
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