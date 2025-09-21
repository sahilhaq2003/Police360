const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import criminal controller
const CriminalController = require('../controllers/CriminalController');

// Import auth middleware
const { protect } = require('../middlewares/authMiddleware');

// Configure multer for criminal photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/criminals';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'criminal-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for criminal photos!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.get('/', protect, CriminalController.getAllCriminals);
router.post('/', protect, CriminalController.addCriminal);
router.post('/upload-photo', protect, upload.single('photo'), CriminalController.uploadPhoto);
router.get('/:id', protect, CriminalController.getCriminalById);
router.put('/:id', protect, CriminalController.updateCriminal);
router.delete('/:id', protect, CriminalController.deleteCriminal);

// Export router
module.exports = router;
