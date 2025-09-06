// routes/gallery.js
const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
dotenv.config()
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({ storage: storage });

// Middleware to check if user has gallery management permissions
const galleryPermission = (req, res, next) => {
  const allowedRoles = ['Admin', 'Pradhan', 'Up-Pradhan', 'Advisor', 'Chief Advisor', 'Treasurer', 'Secretary'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to manage gallery' });
  }
  
  next();
};

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');

    res.json(galleryItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single gallery item
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json(galleryItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new gallery item (protected route)
router.post('/', auth, galleryPermission, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Extract image URLs from uploaded files
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    const galleryItem = new Gallery({
      title,
      description,
      images,
      createdBy: req.user.userId
    });

    await galleryItem.save();

    const populatedItem = await Gallery.findById(galleryItem._id)
      .populate('createdBy', 'name');

    res.status(201).json(populatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update gallery item
router.put('/:id', auth, galleryPermission, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Update fields
    galleryItem.title = title;
    galleryItem.description = description;
    
    await galleryItem.save();
    
    const updatedItem = await Gallery.findById(req.params.id)
      .populate('createdBy', 'name');
    
    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete gallery item
router.delete('/:id', auth, galleryPermission, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Delete images from Cloudinary
    for (const image of galleryItem.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }
    
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Gallery item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add image to existing gallery item
router.post('/:id/images', auth, galleryPermission, upload.array('images', 10), async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Extract image URLs from uploaded files
    const newImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));
    
    // Add new images to the existing ones
    galleryItem.images = [...galleryItem.images, ...newImages];
    
    await galleryItem.save();
    
    res.json(galleryItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete image from gallery item
router.delete('/:id/images/:imageId', auth, galleryPermission, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Find the image to delete
    const imageToDelete = galleryItem.images.find(img => img._id.toString() === req.params.imageId);
    
    if (!imageToDelete) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Delete from Cloudinary if it has a publicId
    if (imageToDelete.publicId) {
      await cloudinary.uploader.destroy(imageToDelete.publicId);
    }
    
    // Remove image from gallery item
    galleryItem.images = galleryItem.images.filter(img => img._id.toString() !== req.params.imageId);
    
    await galleryItem.save();
    
    res.json(galleryItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;