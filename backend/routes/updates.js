// routes/updates.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ImportantUpdate = require('../models/ImportantUpdate');
const { sendPushToAll } = require('../utils/pushService');

const UPDATE_ROLES = ['Admin', 'Pradhan', 'Up Pradhan', 'Secretary', 'Treasurer', 'Chief Advisor'];

// Members only (guests are blocked)
const memberOnly = (req, res, next) => {
  if (!req.user || req.user.role === 'Guest') {
    return res.status(403).json({ message: 'Members only' });
  }
  next();
};

const updatePermission = (req, res, next) => {
  if (!UPDATE_ROLES.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to send updates' });
  }
  next();
};

// Get all important updates
router.get('/', auth, memberOnly, async (req, res) => {
  try {
    const updates = await ImportantUpdate.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role');

    res.json(updates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save an update and push it to every subscribed browser
router.post('/', auth, memberOnly, updatePermission, async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const update = new ImportantUpdate({ title, message, createdBy: req.user.userId });
    await update.save();

    const populated = await ImportantUpdate.findById(update._id).populate('createdBy', 'name role');

    let pushResult = { sent: 0, failed: 0 };
    try {
      pushResult = await sendPushToAll({
        title: `Important update: ${title}`,
        body: message.length > 120 ? `${message.slice(0, 117)}...` : message,
        url: '/updates'
      });
    } catch (pushErr) {
      console.error('Push delivery failed:', pushErr.message);
    }

    res.status(201).json({ update: populated, pushResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an update
router.delete('/:id', auth, memberOnly, updatePermission, async (req, res) => {
  try {
    const update = await ImportantUpdate.findByIdAndDelete(req.params.id);

    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    res.json({ message: 'Update removed' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid update id' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
