const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  uploadEvidence,
  deleteEvidence,
  getReportsByStatus,
  getReportStats,
  verifyReport
} = require('../controllers/reportController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/evidence';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|avi|mov|wav|mp3/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image, document, video, and audio files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: fileFilter
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Report routes are working!' });
});

// Create a new report (with optional file uploads)
router.post('/', upload.array('files', 5), createReport);

// Get all reports with filtering and pagination
router.get('/', getReports);

// Get report statistics
router.get('/stats', getReportStats);

// Get reports by status
router.get('/status/:status', getReportsByStatus);

// Get a single report by ID
router.get('/:id', getReportById);

// Update report status
router.put('/:id/status', updateReportStatus);

// Upload evidence files
router.post('/:id/evidence', upload.array('files', 5), uploadEvidence);

// Delete evidence
router.delete('/:id/evidence/:evidenceId', deleteEvidence);

// Verify report
router.put('/:id/verify', verifyReport);

module.exports = router; 