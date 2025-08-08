const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officerController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/', protect, adminOnly, officerController.createOfficer);

router.get('/', protect, officerController.getAllOfficers);
router.get('/search', protect, officerController.searchOfficers);
router.get('/:id', protect, officerController.getOfficerById);

router.put('/:id', protect, adminOnly, officerController.updateOfficer);

router.delete('/:id', protect, adminOnly, officerController.softDeleteOfficer);
router.delete('/:id/hard', protect, adminOnly, officerController.hardDeleteOfficer);

module.exports = router;
