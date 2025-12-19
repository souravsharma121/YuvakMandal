const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const serverless = require('serverless-http');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const contributionRoutes = require('./routes/contributions');
const expenseRoutes = require('./routes/expense');
const galleryRoutes = require('./routes/gallery');
const weatherRoutes = require('./routes/weather');
const eventsRoutes = require('./routes/events');

// Socket handler
const socketHandler = require('./socketHandler');

dotenv.config();
const app = express();

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Setup Socket.IO handlers
socketHandler(io);

// Middleware
const corsOptions = {
  origin: '*', // allows all origins
};

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

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/loadweather', weatherRoutes);
app.use('/api/events', eventsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      socketio: 'Active'
    }
  });
});

// Socket.IO test endpoint
app.get('/socket-test', (req, res) => {
  res.json({
    socketIO: 'Available',
    connectedClients: io.engine.clientsCount,
    transport: 'websocket, polling'
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

// Start server with Socket.IO
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server ready`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Socket test: http://localhost:${PORT}/socket-test`);
});

// Export serverless handler (for deployment)
// module.exports = app;
// module.exports.handler = serverless(app);

// Export server and io for local development
module.exports.server = server;
module.exports.io = io;