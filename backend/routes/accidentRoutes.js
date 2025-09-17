const express = require('express');
const router = express.Router();

const {
  reportAccident,
  getByTrackingId,
  listAccidents,
  getAccident,
  updateAccident,
  deleteAccident,
  addInvestigationNote,
} = require('../controllers/accidentController');

const { protect } = require('../middlewares/authMiddleware');

router.post('/report', reportAccident);
router.get('/track/:trackingId', getByTrackingId);

// OFFICERS (AUTH REQUIRED)
router.get('/', listAccidents);
router.get('/:id', protect, getAccident);
router.put('/:id', protect, updateAccident);
router.delete('/:id', protect, deleteAccident);
router.post('/:id/notes', protect, addInvestigationNote);

module.exports = router;
