const express = require('express');
const router = express.Router();
const { getAllSuspects, addSuspect, getSuspectById, updateSuspect, deleteSuspect } = require('../controllers/SuspectController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAllSuspects);
router.post('/', protect, addSuspect);
router.get('/:id', protect, getSuspectById);
router.put('/:id', protect, updateSuspect);
router.delete('/:id', protect, deleteSuspect);

module.exports = router;

