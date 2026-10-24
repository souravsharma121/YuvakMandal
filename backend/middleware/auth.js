// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  let decoded;

  try {
    // Special handling for guest token
    if (token === 'guest-token') {
      req.user = { userId: 'guest-user', role: 'Guest' };
      return next();
    }
    
    // Verify normal token
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  try {
    // Re-check the account on every request so role and status changes apply immediately
    const user = await User.findById(decoded.userId).select('role isActive passwordChangedAt');

    if (!user || user.isActive === 'No') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }

    req.user = { userId: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    console.error('Auth check failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
};