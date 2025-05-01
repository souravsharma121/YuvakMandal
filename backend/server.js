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
dotenv.config();
const app = express();

// Middleware
const allowedOrigins = [
  'https://yuvakmandalapp.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Optional: If you're using cookies or sessions
}));

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
// // Frontend Static
// const __dirname1 = path.resolve();
// const staticPath = path.join(__dirname1, '../frontend/YuvakMandal/dist');
// app.use(express.static(staticPath));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(staticPath, 'index.html'));
// });

// Export serverless handler
module.exports = app;
module.exports.handler = serverless(app);