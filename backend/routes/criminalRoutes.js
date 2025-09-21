const express = require('express');
const router = express.Router();

// Import criminal controller
const CriminalController = require('../controllers/CriminalController');

// Import auth middleware
const { protect } = require('../middlewares/authMiddleware');

// Routes
router.get('/', protect, CriminalController.getAllCriminals);
router.post('/', protect, CriminalController.addCriminal);
router.get('/:id', protect, CriminalController.getCriminalById);
router.put('/:id', protect, CriminalController.updateCriminal);
router.delete('/:id', protect, CriminalController.deleteCriminal);

// Export router
module.exports = router;
