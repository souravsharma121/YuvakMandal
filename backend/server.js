const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const serverless = require('serverless-http');
const helmet = require('helmet');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const contributionRoutes = require('./routes/contributions');
const expenseRoutes = require('./routes/expense');
const galleryRoutes = require('./routes/gallery');
const shareRoutes = require('./routes/share');
const weatherRoutes = require('./routes/weather');
const eventsRoutes = require('./routes/events');
const documentRoutes = require('./routes/documents');
const updateRoutes = require('./routes/updates');
const pushRoutes = require('./routes/push');

dotenv.config();
const app = express();

// Behind Vercel's proxy so rate limits key on the real client IP
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://yuvakmandalapp.vercel.app')
  .split(',')
  .map(origin => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true
};

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static data files (for SEO-friendly public data)
app.use('/static-data', express.static(path.join(__dirname, 'public')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads', 'events');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB - Connect with proper error handling
let mongoConnected = false;

if (process.env.MONGO_URI) {
  const mongoStartTime = Date.now();
  
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: false
  })
    .then(() => {
      mongoConnected = true;
      console.log(`✅ MongoDB Connected (${Date.now() - mongoStartTime}ms)`);
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
    });

  // Handle connection events
  mongoose.connection.on('connected', () => {
    mongoConnected = true;
    console.log('✅ MongoDB reconnected');
  });
  
  mongoose.connection.on('disconnected', () => {
    mongoConnected = false;
    console.warn('⚠️ MongoDB disconnected');
  });
} else {
  console.warn('⚠️ MONGO_URI not set. Please configure it in Vercel environment variables.');
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/loadweather', weatherRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/push', pushRoutes);
// Share pages for social previews (HTML with OG tags)
app.use('/share', shareRoutes);

// Health check endpoint with connection warmup
app.get('/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStatus = mongoState === 1 ? 'Connected' : mongoState === 2 ? 'Connecting' : 'Disconnected';
  
  res.status(mongoState === 1 ? 200 : 503).json({ 
    status: mongoState === 1 ? 'OK' : 'Degraded',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus,
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ msg: 'File size too large. Maximum size is 5MB.' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ msg: 'Too many files or unexpected field name.' });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ msg: 'Duplicate entry found.' });
  }
  
  // Default error
  res.status(500).json({ 
    msg: 'Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404 routes
// app.use('*', (req, res) => {
//   res.status(404).json({ msg: 'Route not found' });
// });

// Export for Express app and serverless handler
module.exports = app;
module.exports.handler = serverless(app);

// For local development only
if (require.main === module && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const http = require('http');
  const socketIo = require('socket.io');
  const socketHandler = require('./socketHandler');

  // Create HTTP server with Socket.IO only for local development
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  socketHandler(io);
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO server ready`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}