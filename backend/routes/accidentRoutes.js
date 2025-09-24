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
} = require('../controllers/accidentController');

router.post('/report', reportAccident);
router.get('/track/:trackingId', getByTrackingId);
router.get('/insurance', getByInsuranceRef);

router.get('/', listAccidents);
router.get('/:id', getAccident);
router.put('/:id', updateAccident);
router.delete('/:id', deleteAccident);
router.post('/:id/notes', addInvestigationNote);
router.post('/:id/assign', assignOfficer);

module.exports = router;
