// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const contributionRoutes = require('./routes/contributions');
const path = require('path')
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contributions', contributionRoutes);


// ---------------deployment-----------------//
// ---------------deployment-----------------//
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  const staticPath = path.join(__dirname1, '../frontend/YuvakMandal/dist');
  app.use(express.static(staticPath));

  // Handle React routing, return all requests to React app
  app.get('/', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    console.log('Index Path:', indexPath); 
    res.sendFile(indexPath);
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));