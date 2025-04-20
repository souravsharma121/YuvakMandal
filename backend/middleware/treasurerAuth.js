// middleware/treasurerAuth.js
module.exports = (req, res, next) => {
    // Check if user is treasurer
    if (req.user.role !== 'Treasurer' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Treasurer only.' });
    }
    
    next();
};