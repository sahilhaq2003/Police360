const express = require('express');
const router = express.Router();
const { getAllSuspects, addSuspect, getSuspectById, updateSuspect, deleteSuspect } = require('../controllers/SuspectController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, SuspectController.getAllSuspects);
router.post('/', protect, SuspectController.addSuspect);
router.get('/:id', protect, SuspectController.getSuspectById);
router.put('/:id', protect, SuspectController.updateSuspect);
router.delete('/:id', protect, SuspectController.deleteSuspect);

module.exports = router;

