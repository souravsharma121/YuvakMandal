const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const serverless = require('serverless-http');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const contributionRoutes = require('./routes/contributions');
const expenseRoutes = require('./routes/expense')
const galleryRoutes = require('./routes/gallery')
const weatherRoutes = require('./routes/weather')
dotenv.config();
const app = express();

// Middleware
const corsOptions = {
  origin: '*',// allows all origins
};

app.use(cors(corsOptions));

app.use(express.json());

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

// Export serverless handler
module.exports = app;
module.exports.handler = serverless(app);