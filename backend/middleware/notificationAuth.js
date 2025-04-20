// middleware/notificationAuth.js
module.exports = (req, res, next) => {
    // Check if user is allowed to create notifications
    const allowedRoles = ['Admin', 'Pradhan', 'Secretary', 'Treasurer', 'Core Member'];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Not authorized to create notifications.' });
    }
    
    next();
  };
  