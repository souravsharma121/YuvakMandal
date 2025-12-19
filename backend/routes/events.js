const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Event = require('../models/Events');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/events';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/events
// @desc    Get all events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: status === 'past' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (All roles except Member)
router.post('/', [
  auth,
  upload.single('backgroundImage'),
  [
    check('name', 'Event name is required').not().isEmpty().trim(),
    check('type', 'Event type is required').not().isEmpty(),
    check('entryFee', 'Entry fee must be a number').isNumeric(),
    check('instructions', 'Instructions are required').not().isEmpty().trim(),
    check('date', 'Valid date is required').isISO8601(),
    check('time', 'Time is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty().trim()
  ]
], async (req, res) => {
  try {
    // Check user role - only allow all roles except 'Member'
    if (req.user.role === 'Member') {
      return res.status(403).json({ 
        msg: 'Access denied. Members cannot create events.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      type,
      entryFee,
      instructions,
      date,
      time,
      location,
      maxTeams,
      registrationDeadline,
      totalOvers,
    } = req.body;

    const eventData = {
      name,
      type,
      entryFee: parseFloat(entryFee),
      instructions,
      date,
      time,
      location,
      createdBy: req.user.userId,
      maxTeams: maxTeams || 2,
      registrationDeadline: registrationDeadline || date
    };

    if (req.file) {
      eventData.backgroundImage = `/uploads/events/${req.file.filename}`;
    }

    if (totalOvers) {
      eventData.liveScore = {
        ...eventData.liveScore,
        totalOvers: parseInt(totalOvers)
      };
    }

    const event = new Event(eventData);
    await event.save();

    await event.populate('createdBy', 'name email');

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Creator, Admin)
router.put('/:id', [
  auth,
  upload.single('backgroundImage'),
  [
    check('name', 'Event name is required').optional().not().isEmpty().trim(),
    check('entryFee', 'Entry fee must be a number').optional().isNumeric(),
    check('date', 'Valid date is required').optional().isISO8601(),
    check('location', 'Location is required').optional().not().isEmpty().trim()
  ]
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.backgroundImage = `/uploads/events/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('createdBy', 'name email');

    res.json(updatedEvent);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Creator, Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/events/:id/teams
// @desc    Add team to event
// @access  Private
router.post('/:id/teams', [
  auth,
  [
    check('teamName', 'Team name is required').not().isEmpty().trim(),
    check('captain', 'Captain name is required').not().isEmpty().trim(),
    check('players', 'Players array is required').isArray({ min: 1 })
  ]
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teamName, captain, players } = req.body;
    
    // Check if maximum teams reached
    if (event.teams.length >= event.maxTeams) {
      return res.status(400).json({ msg: 'Maximum teams limit reached' });
    }
    
    // Check if team name already exists
    const existingTeam = event.teams.find(team => 
      team.teamName.toLowerCase() === teamName.toLowerCase()
    );
    
    if (existingTeam) {
      return res.status(400).json({ msg: 'Team name already exists' });
    }

    const newTeam = {
      teamName,
      captain,
      players: players.map(player => ({
        name: player.name,
        age: player.age,
        role: player.role,
        contact: player.contact
      }))
    };

    event.teams.push(newTeam);
    await event.save();

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/events/:id/teams/:teamId
// @desc    Update team in event
// @access  Private
router.put('/:id/teams/:teamId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    const team = event.teams.id(req.params.teamId);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    const { teamName, captain, players } = req.body;
    
    if (teamName) team.teamName = teamName;
    if (captain) team.captain = captain;
    if (players) team.players = players;

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/events/:id/teams/:teamId
// @desc    Remove team from event
// @access  Private (Creator, Admin)
router.delete('/:id/teams/:teamId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    event.teams.pull(req.params.teamId);
    await event.save();

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/events/:id/status
// @desc    Update event status
// @access  Private (Creator, Admin)
router.put('/:id/status', [
  auth,
  [check('status', 'Status is required').isIn(['new', 'ongoing', 'past'])]
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    event.status = req.body.status;
    
    // Update live score status
    if (req.body.status === 'ongoing') {
      event.liveScore.isLive = true;
    } else if (req.body.status === 'past') {
      event.liveScore.isLive = false;
    }
    
    await event.save();
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;