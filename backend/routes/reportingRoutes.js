const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middlewares/authMiddleware');
const { createReporting, getReportings, getReportingById,updateReporting,deleteReporting, getReportingStats, getMyReports, assignOfficer  } = require('../controllers/reportingController');

// setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/reporting';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 5 } });

// Routes
router.get('/test', (req, res) => res.json({ message: 'Reporting routes working!' }));
router.get('/stats', getReportingStats);
router.get('/my', auth.protect, getMyReports);
router.post('/', upload.array('files', 5), createReporting);
router.get('/', getReportings);
router.get('/:id', getReportingById);
router.put('/:id', upload.array('files', 5), updateReporting);
router.delete('/:id', deleteReporting);
router.post('/:id/assign', assignOfficer);

module.exports = router;
