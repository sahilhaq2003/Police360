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

router.post('/report', reportAccident);
router.get('/track/:trackingId', getByTrackingId);

// OFFICERS (AUTH REQUIRED)
router.get('/', listAccidents);
router.get('/:id', getAccident);
router.put('/:id', updateAccident);
router.delete('/:id', deleteAccident);
router.post('/:id/notes', addInvestigationNote);

module.exports = router;
