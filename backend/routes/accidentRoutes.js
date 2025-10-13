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
  assignOfficer,
  getByInsuranceRef,
  updateInvestigationNote,
  deleteInvestigationNote,
} = require('../controllers/accidentController');

router.post('/report', reportAccident);
router.get('/insurance', getByInsuranceRef);
router.get('/by-tracking/:trackingId', getByTrackingId);

router.get('/', listAccidents);
router.get('/:id', getAccident);
router.put('/:id', updateAccident);
router.delete('/:id', deleteAccident);
router.post('/:id/notes', addInvestigationNote);
router.put('/:id/notes/:noteId', updateInvestigationNote);
router.post('/:id/assign', assignOfficer);
router.delete('/:id/notes/:noteId', deleteInvestigationNote);

module.exports = router;
