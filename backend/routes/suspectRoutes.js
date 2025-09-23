const express = require('express');
const router = express.Router();
const { getAllSuspects, addSuspect, getSuspectById, updateSuspect, deleteSuspect } = require('../controllers/SuspectController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getAllSuspects).post(protect, addSuspect);
router.route('/:id').get(protect, getSuspectById).put(protect, updateSuspect).delete(protect, deleteSuspect);

module.exports = router;
