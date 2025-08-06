const express = require('express');
const router = express.Router();
const officerController = require('../controllers/OfficerController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Create a new officer (Admin only)
router.post('/', protect, adminOnly, officerController.createOfficer);

// Get all active officers (Accessible by logged-in users)
router.get('/', protect, officerController.getAllOfficers);

// Get a specific officer by ID (Accessible by logged-in users)
router.get('/:id', protect, officerController.getOfficerById);

// Update an officer by ID (Admin only)
router.put('/:id', protect, adminOnly, officerController.updateOfficer);

// Soft delete (deactivate) an officer by ID (Admin only)
router.delete('/:id', protect, adminOnly, officerController.softDeleteOfficer);

// Search officers by keyword (name, username, etc.)
router.get('/search', protect, officerController.searchOfficers);

module.exports = router;
