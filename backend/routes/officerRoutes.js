const express = require('express');
const router = express.Router();
const officerController = require('../controllers/OfficerController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/', protect, adminOnly, officerController.createOfficer);
router.get('/', protect, officerController.getAllOfficers);
router.put('/:id', protect, adminOnly, officerController.updateOfficer);
router.delete('/:id', protect, adminOnly, officerController.softDeleteOfficer);
router.get('/search', protect, officerController.searchOfficers);

module.exports = router;
