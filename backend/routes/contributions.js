// routes/contributions.js
const express = require('express');
const router = express.Router();
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const notificationService = require('../utils/notificationService');
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

// Delete a contribution (Admin/Treasurer only)
router.delete('/:id', auth, treasurerAuth, async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    await Contribution.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contribution deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a contribution (Admin/Treasurer only) - allows editing amount, month, year, notes
router.put('/:id', auth, treasurerAuth, async (req, res) => {
  try {
    const { amount, month, year, notes } = req.body;

    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    // If month/year are being changed, ensure no duplicate exists for same user
    if ((month && month !== contribution.month) || (year && parseInt(year) !== contribution.year)) {
      const existing = await Contribution.findOne({
        user: contribution.user,
        month: month || contribution.month,
        year: year ? parseInt(year) : contribution.year
      });
      if (existing && existing._id.toString() !== contribution._id.toString()) {
        return res.status(400).json({ message: 'Another contribution exists for this user in the same month/year' });
      }
    }

    if (amount !== undefined) contribution.amount = amount;
    if (month) contribution.month = month;
    if (year) contribution.year = parseInt(year);
    if (notes !== undefined) contribution.notes = notes;

    contribution.updatedAt = Date.now();

    await contribution.save();

    const updated = await Contribution.findById(contribution._id)
      .populate('user', 'name mobileNumber email')
      .populate('approvedBy', 'name');

    res.json(updated);
  } catch (err) {
    console.error('Update contribution error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Notify pending contributions to users (Treasurer/Admin)
router.post('/notify-pending', auth, treasurerAuth, async (req, res) => {
  try {
    const { userIds, all, month, year, via, mode, status, village, member } = req.body;
    console.log('notify-pending called by', req.user?.userId, 'payload:', { userIds, all, month, year, via, mode, status, village, member });
    const channels = Array.isArray(via) && via.length ? via : ['email', 'whatsapp'];

    let targets = [];
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    if (all) {
      if (mode === 'alert') {
        // For alert mode: notify members with pending payments from their last payment until current month
        const users = await User.find({
          role: { $ne: 'Admin' },
          $or: [ { isActive: true }, { isActive: 'Yes' }, { isActive: 'yes' }, { isActive: 'YES' } ]
        }).select('name mobileNumber email isActive');

        for (const u of users) {
          // Get ALL contributions for this user to find last payment
          const allContributions = await Contribution.find({ user: u._id }).sort({ createdAt: -1 });
          
          // Filter to get contributions matching year/month if specified
          let q = { user: u._id };
          if (year) q.year = parseInt(year);
          if (month) q.month = month;
          const contributions = await Contribution.find(q);

          // Check if user has any outstanding (pending or no contribution)
          const monthMap = {};
          months.forEach(m => { monthMap[m] = { amount: 0, status: 'No contribution' }; });
          contributions.forEach(c => {
            if (!c || !c.month) return;
            const key = c.month;
            const amt = parseFloat(c.amount) || 0;
            monthMap[key].amount = (monthMap[key].amount || 0) + amt;
            if (c.status === 'Pending') monthMap[key].status = 'Pending';
            else monthMap[key].status = c.status || monthMap[key].status;
          });

          let hasOutstanding = false;
          if (month) {
            const entry = monthMap[month];
            hasOutstanding = entry && (entry.status !== 'Approved' || (entry.amount || 0) === 0);
          } else {
            hasOutstanding = Object.values(monthMap).some(e => e.status !== 'Approved' || (e.amount || 0) === 0);
          }
          if (hasOutstanding) {
            targets.push({ user: u, contributions });
          }
        }
      } else if (mode === 'currentMonthOnly') {
        // For currentMonthOnly: notify only members with NO contribution record for the specified month/year
        const users = await User.find({
          role: { $ne: 'Admin' },
          $or: [ { isActive: true }, { isActive: 'Yes' }, { isActive: 'yes' }, { isActive: 'YES' } ]
        }).select('name mobileNumber email isActive');

        for (const u of users) {
          // Check if user has ANY contribution for this specific month/year
          const existingContribution = await Contribution.findOne({
            user: u._id,
            month: month,
            year: parseInt(year)
          });

          // Only include if NO contribution exists for this month
          if (!existingContribution) {
            targets.push({ user: u, contributions: [] });
          }
        }
      } else {
        // default: find pending contributions optionally filtered by month/year
        const q = { status: 'Pending' };
        if (month) q.month = month;
        if (year) q.year = parseInt(year);

        const pending = await Contribution.find(q).populate('user', 'name mobileNumber email');
        console.log('notify-pending: pending query', q, 'found:', pending.length);

        const map = {};
        pending.forEach(c => {
          if (!c.user) return;
          const id = c.user._id.toString();
          if (!map[id]) map[id] = { user: c.user, contributions: [] };
          map[id].contributions.push(c);
        });

        targets = Object.values(map);
      }
    } else if (Array.isArray(userIds) && userIds.length) {
      // explicit users requested
      console.log('notify-pending: explicit userIds count', userIds.length, 'mode', mode || 'pending');
      for (const uid of userIds) {
        const user = await User.findById(uid).select('name mobileNumber email isActive villageName');
        if (!user) continue;
        // skip inactive users
        if (!(user.isActive === true || user.isActive === 'Yes' || user.isActive === 'yes' || user.isActive === 'YES')) continue;
        
        let q = { user: uid };
        
        // For filtered mode: apply all filters to match what was shown in frontend table
        if (mode === 'filtered') {
          if (status) q.status = status;
          if (month) q.month = month;
          if (year) q.year = parseInt(year);
          if (village && user.villageName !== village) continue; // Skip if village doesn't match
          if (member && user.name !== member) continue; // Skip if member name doesn't match
        } else if (mode === 'alert') {
          if (month) q.month = month;
          if (year) q.year = parseInt(year);
        } else if (mode === 'currentMonthOnly') {
          q.month = month;
          q.year = parseInt(year);
        } else {
          // default (pending mode): fetch only pending contributions
          q.status = 'Pending';
          if (month) q.month = month;
          if (year) q.year = parseInt(year);
        }
        
        const contributions = await Contribution.find(q);
        console.log('notify-pending: for user', uid, 'query', q, 'found', contributions.length);

        // If alert mode, only include users who have outstanding contributions
        if (mode === 'alert') {
          const monthMap = {};
          months.forEach(m => { monthMap[m] = { amount: 0, status: 'No contribution' }; });
          contributions.forEach(c => {
            if (!c || !c.month) return;
            const key = c.month;
            const amt = parseFloat(c.amount) || 0;
            monthMap[key].amount = (monthMap[key].amount || 0) + amt;
            if (c.status === 'Pending') monthMap[key].status = 'Pending';
            else monthMap[key].status = c.status || monthMap[key].status;
          });
          const hasOutstanding = Object.values(monthMap).some(e => e.status !== 'Approved' || (e.amount || 0) === 0);
          if (hasOutstanding) targets.push({ user, contributions });
        } else if (mode === 'currentMonthOnly') {
          // Only send alert if no contribution found (empty contributions array)
          if (contributions.length === 0) {
            targets.push({ user, contributions });
          }
        } else {
          targets.push({ user, contributions });
        }
      }
    } else {
      return res.status(400).json({ message: 'Provide userIds or set all=true' });
    }

    const report = [];

    for (const t of targets) {
      const user = t.user;
      const contributions = t.contributions || [];

      const result = await notificationService.sendPendingAlert(user, contributions, channels, mode || 'pending', year);
      report.push({ userId: user._id, name: user.name, result });
    }

    const pendingCount = targets.reduce((sum, t) => sum + (t.contributions ? t.contributions.length : 0), 0);
    console.log('notify-pending: processed targets', targets.length, 'pendingCount', pendingCount);

    res.json({ message: 'Notifications processed', report, pendingCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Preview targets for notifications without sending (debug helper)
router.post('/notify-preview', auth, treasurerAuth, async (req, res) => {
  try {
    const { userIds, all, month, year, mode, status, village, member } = req.body;
    const previewTargets = [];
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    if (all) {
      if (mode === 'alert') {
        const users = await User.find({
          role: { $ne: 'Admin' },
          $or: [ { isActive: true }, { isActive: 'Yes' }, { isActive: 'yes' }, { isActive: 'YES' } ]
        }).select('name mobileNumber email');
        for (const u of users) {
          const q = { user: u._id };
          if (year) q.year = parseInt(year);
          if (month) q.month = month;
          const contributions = await Contribution.find(q);
          previewTargets.push({ userId: u._id, name: u.name, contributionsCount: contributions.length });
        }
      } else if (mode === 'currentMonthOnly') {
        const users = await User.find({
          role: { $ne: 'Admin' },
          $or: [ { isActive: true }, { isActive: 'Yes' }, { isActive: 'yes' }, { isActive: 'YES' } ]
        }).select('name mobileNumber email');
        for (const u of users) {
          const existingContribution = await Contribution.findOne({
            user: u._id,
            month: month,
            year: parseInt(year)
          });
          if (!existingContribution) {
            previewTargets.push({ userId: u._id, name: u.name, reason: 'No contribution for this month' });
          }
        }
      } else {
        const q = { status: 'Pending' };
        if (month) q.month = month;
        if (year) q.year = parseInt(year);
        const pending = await Contribution.find(q).populate('user', 'name');
        const map = {};
        pending.forEach(c => {
          if (!c.user) return;
          const id = c.user._id.toString();
          map[id] = map[id] || { userId: c.user._id, name: c.user.name, contributionsCount: 0 };
          map[id].contributionsCount += 1;
        });
        Object.values(map).forEach(v => previewTargets.push(v));
      }
    } else if (Array.isArray(userIds) && userIds.length) {
      for (const uid of userIds) {
        const u = await User.findById(uid).select('name villageName');
        if (!u) continue;
        
        let q = { user: uid };
        let skip = false;
        
        if (mode === 'filtered') {
          if (status) q.status = status;
          if (month) q.month = month;
          if (year) q.year = parseInt(year);
          if (village && u.villageName !== village) skip = true;
          if (member && u.name !== member) skip = true;
        } else if (mode === 'alert') {
          if (month) q.month = month;
          if (year) q.year = parseInt(year);
        } else if (mode === 'currentMonthOnly') {
          q.month = month;
          q.year = parseInt(year);
        } else {
          q.status = 'Pending';
          if (month) q.month = month;
          if (year) q.year = parseInt(year);
        }
        
        if (!skip) {
          const contributions = await Contribution.find(q);
          previewTargets.push({ userId: u._id, name: u.name, contributionsCount: contributions.length });
        }
      }
    }

    res.json({ targets: previewTargets, totalTargets: previewTargets.length });
  } catch (err) {
    console.error('notify-preview error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
