// routes/contributions.js
const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const auth = require('../middleware/auth');
const treasurerAuth = require('../middleware/treasurerAuth');

// Get all contributions
router.get('/', auth, async (req, res) => {
  try {
    // Allow both Admin and Treasurer to see all contributions
    const query = {};

    const contributions = await Contribution.find(query)
      .sort({
        year: -1,
        month: -1
      })
      .populate('user', 'name')
      .populate('approvedBy', 'name');

    res.json(contributions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Get contributions by user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if user is requesting their own data or is an admin
    if (req.params.userId !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    const contributions = await Contribution.find({
        user: req.params.userId
      })
      .sort({
        year: -1,
        month: -1
      })
      .populate('approvedBy', 'name');

    res.json(contributions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Get contributions by month and year
router.get('/month/:month/year/:year', auth, async (req, res) => {
  try {
    const {
      month,
      year
    } = req.params;

    const contributions = await Contribution.find({
        month,
        year: parseInt(year)
      })
      .populate('user', 'name')
      .populate('approvedBy', 'name');

    res.json(contributions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Submit contribution request
router.post('/', auth, async (req, res) => {
  try {
    const {
      amount,
      month,
      year,
      notes
    } = req.body;

    // Check if contribution already exists for this month and year
    const existingContribution = await Contribution.findOne({
      user: req.user.userId,
      month,
      year: parseInt(year)
    });

    if (existingContribution) {
      return res.status(400).json({
        message: 'Contribution already submitted for this month'
      });
    }

    const contribution = new Contribution({
      user: req.user.userId,
      amount,
      month,
      year: parseInt(year),
      notes,
      status: 'Pending'
    });

    await contribution.save();

    const populatedContribution = await Contribution.findById(contribution._id)
      .populate('user', 'name');

    res.status(201).json(populatedContribution);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Approve/Reject contribution (Treasurer only)
router.put('/:id/status', auth, treasurerAuth, async (req, res) => {
  try {
    const {
      status,
      notes
    } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }

    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        message: 'Contribution not found'
      });
    }

    contribution.status = status;
    contribution.approvedBy = req.user.userId;
    contribution.approvalDate = Date.now();

    if (notes) {
      contribution.notes = notes;
    }

    await contribution.save();

    const updatedContribution = await Contribution.findById(req.params.id)
      .populate('user', 'name')
      .populate('approvedBy', 'name');

    res.json(updatedContribution);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

// Add contribution for another member (Admin/Treasurer only)
router.post('/admin-add', auth, async (req, res) => {
  try {
    // Verify the user is admin or treasurer    
    if (req.user.role !== 'Admin' && req.user.role !== 'Treasurer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      user,
      amount,
      month,
      year,
      notes
    } = req.body;

    // Check if the user being added is the same as the logged-in user
    const isOwnContribution = user === req.user.userId; 
    
    
    // Check if contribution already exists for this month and year (for users other than self)
    if (!isOwnContribution) {
      const existingContribution = await Contribution.findOne({
        user,
        month,
        year: parseInt(year)
      });

      if (existingContribution) {
        return res.status(400).json({
          message: 'Contribution already submitted for this month'
        });
      }
    }

    const contribution = new Contribution({
      user, // Use the provided user ID
      amount,
      month,
      year: parseInt(year),
      notes,
      status: 'Approved', // Auto-approve when added by admin/treasurer
      approvedBy: req.user.userId,
      approvalDate: Date.now()
    });

    await contribution.save();

    const populatedContribution = await Contribution.findById(contribution._id)
      .populate('user', 'name')
      .populate('approvedBy', 'name');

    res.status(201).json(populatedContribution);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});


module.exports = router;