// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const notificationAuth = require('../middleware/notificationAuth');

// Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role');
    
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notification (Admin, Pradhan, Secretary, Treasurer, Core Member only)
router.post('/', auth, notificationAuth, async (req, res) => {
  try {
    const { title, message } = req.body;
    
    const notification = new Notification({
      title,
      message,
      createdBy: req.user.userId
    });
    
    await notification.save();
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('createdBy', 'name role');
    
    res.status(201).json(populatedNotification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin or the creator can delete a notification
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is admin or creator of the notification
    if (req.user.role !== 'Admin' && notification.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
