// middleware/adminAuth.js
module.exports = (req, res, next) => {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  };
  