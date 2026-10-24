// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const bcrypt = require('bcryptjs'); // Add this import for password hashing
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for profile images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all users (public)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, mobileNumber, email, password, villageName, role, isActive } = req.body;
    
    // Check if mobile number already exists
    let user = await User.findOne({ mobileNumber });
    if (user) {
      return res.status(400).json({ message: 'User with this mobile number already exists' });
    }
    
    // Check if role is unique (Pradhan, Secretary, Treasurer)
    if (['Pradhan', 'Up Pradhan', 'Secretary', 'Treasurer', 'Chief Advisor'].includes(role)) {
      const existingRoleUser = await User.findOne({ role });
      if (existingRoleUser) {
        return res.status(400).json({ message: `A ${role} already exists` });
      }
    }
    
    user = new User({
      name,
      mobileNumber,
      email,
      password: password,
      villageName,
      villageName,
      role,
      isActive
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        villageName: user.villageName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image (authenticated users can update their own, admins can update anyone)
router.post('/:id/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.user.userId !== req.params.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old image from Cloudinary if it exists
    if (user.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.imagePublicId);
      } catch (err) {
        console.error('Error deleting old image from Cloudinary:', err);
        // Don't fail the request if old image deletion fails
      }
    }

    // Update user with new image
    user.image = req.file.path; // Cloudinary URL
    user.imagePublicId = req.file.filename; // Cloudinary public ID for future deletion
    user.updatedAt = Date.now();
    
    await user.save();

    res.json({
      message: 'Profile image updated successfully',
      user: {
        id: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update user (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, mobileNumber, email, villageName, role, isActive, password } = req.body;
    
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if mobile number already exists for another user
    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'User with this mobile number already exists' });
      }
    }

    // Check if role is unique (Pradhan, Up Pradhan, Secretary, Treasurer, Chief Advisor)
    if (
      role && 
      ['Pradhan', 'Up Pradhan', 'Secretary', 'Treasurer', 'Chief Advisor'].includes(role) &&
      role !== user.role
    ) {
      const existingRoleUser = await User.findOne({ role });
      if (existingRoleUser && existingRoleUser._id.toString() !== req.params.id) {
        return res.status(400).json({ message: `A ${role} already exists` });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (villageName) user.villageName = villageName;
    if (role) user.role = role;
    if (isActive) user.isActive = isActive;
    
    // Handle email explicitly (allow clearing it if empty string is sent)
    if (email !== undefined) {
      user.email = email;
    }

    // Only update password if a new one is provided
    if (password) {
      user.password = password;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        villageName: user.villageName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete profile image from Cloudinary if it exists
    if (user.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.imagePublicId);
      } catch (err) {
        console.error('Error deleting profile image from Cloudinary:', err);
        // Don't fail the request if image deletion fails
      }
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;