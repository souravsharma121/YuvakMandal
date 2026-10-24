// routes/push.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PushSubscription = require('../models/PushSubscription');
const { isConfigured } = require('../utils/pushService');

// Members only (guests are blocked)
const memberOnly = (req, res, next) => {
  if (!req.user || req.user.role === 'Guest') {
    return res.status(403).json({ message: 'Members only' });
  }
  next();
};

// Public VAPID key the browser needs to subscribe
router.get('/public-key', auth, memberOnly, (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ message: 'Push notifications are not configured' });
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Store or update this browser's subscription for the logged-in member
router.post('/subscribe', auth, memberOnly, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Invalid push subscription' });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { user: req.user.userId, endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      { upsert: true, new: true }
    );

    res.json({ message: 'Subscribed to notifications' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove this browser's subscription (called on logout)
router.post('/unsubscribe', auth, memberOnly, async (req, res) => {
  try {
    await PushSubscription.deleteOne({ endpoint: req.body.endpoint, user: req.user.userId });
    res.json({ message: 'Unsubscribed from notifications' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
