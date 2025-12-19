const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 10,
    max: 60
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  stats: {
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    oversBowled: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 }
  }
});

const TeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  captain: {
    type: String,
    required: true,
    trim: true
  },
  players: [PlayerSchema],
  score: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cricket', 'volleyball', 'football', 'kabaddi', 'kho-kho', 'badminton', 'table-tennis', 'other'],
    default: 'cricket'
  },
  entryFee: {
    type: Number,
    required: true,
    min: 0
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  backgroundImage: {
    type: String, // URL to uploaded image
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'ongoing', 'past'],
    default: 'new'
  },
  teams: [TeamSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  liveScore: {
    currentInnings: { type: Number, default: 1 },
    currentBowler: { type: String, default: '' },
    currentBatsman: [{ type: String }],
    lastBalls: [{ type: String }], // Last 6 balls
    totalOvers: { type: Number, default: 20 },
    isLive: { type: Boolean, default: false }
  },
  maxTeams: {
    type: Number,
    default: 2
  },
  registrationDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Update event status based on date
EventSchema.pre('save', function(next) {
  const now = new Date();
  const eventDate = new Date(this.date);
  
  if (eventDate < now && this.status === 'new') {
    this.status = 'past';
  } else if (eventDate.toDateString() === now.toDateString() && this.status === 'new') {
    this.status = 'ongoing';
  }
  
  next();
});

// Index for better query performance
EventSchema.index({ status: 1, date: -1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ type: 1 });

module.exports = mongoose.model('Event', EventSchema);