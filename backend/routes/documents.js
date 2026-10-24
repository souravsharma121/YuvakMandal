// routes/documents.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const ImportantDocument = require('../models/ImportantDocument');
const auth = require('../middleware/auth');

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const UPLOAD_ROLES = ['Admin', 'Pradhan', 'Up Pradhan', 'Treasurer', 'Secretary', 'Chief Advisor'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and image files are allowed'));
  }
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File size must be 10MB or less' : err.message;
      return res.status(400).json({ message });
    }
    next();
  });
};

// Members only (guests are blocked)
const memberOnly = (req, res, next) => {
  if (!req.user || req.user.role === 'Guest') {
    return res.status(403).json({ message: 'Members only' });
  }
  next();
};

const documentPermission = (req, res, next) => {
  if (!UPLOAD_ROLES.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to manage documents' });
  }
  next();
};

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'important-documents',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

// Get all important documents
router.get('/', auth, memberOnly, async (req, res) => {
  try {
    const documents = await ImportantDocument.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name role');

    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload a new document (PDF or image)
router.post('/', auth, memberOnly, documentPermission, handleUpload, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please choose a file to upload' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const document = new ImportantDocument({
      title: title.trim(),
      description,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      originalName: req.file.originalname,
      fileSize: result.bytes,
      uploadedBy: req.user.userId
    });

    await document.save();

    const populated = await ImportantDocument.findById(document._id)
      .populate('uploadedBy', 'name role');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a document
router.delete('/:id', auth, memberOnly, documentPermission, async (req, res) => {
  try {
    const document = await ImportantDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await cloudinary.uploader.destroy(document.publicId, {
      resource_type: document.resourceType,
      invalidate: true
    });

    await ImportantDocument.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
