const express = require('express');
const router = express.Router();
const {
  createITCase,
  listITCases,
  getITCase,
  assignOfficerToITCase,
  closeITCase,
  updateITCase,
  deleteITCase,
  acceptITCase,
  declineITCase,
  addNote,
  requestCloseITCase,
  approveCloseITCase,
  declineCloseITCase,
} = require('../controllers/itCaseController');

const auth = require('../middlewares/authMiddleware');

// public: allow unauthenticated users to submit IT cases
router.post('/', createITCase);
router.get('/', auth.protect, listITCases);
// allow public read of a single case so success pages can be viewed without login
router.get('/:id', getITCase);
router.post('/:id/assign', auth.protect, auth.itOnly, assignOfficerToITCase);
router.post('/:id/close', auth.protect, closeITCase);
router.post('/:id/accept', auth.protect, acceptITCase);
router.post('/:id/decline', auth.protect, declineITCase);
router.post('/:id/notes', auth.protect, addNote);
router.post('/:id/request-close', auth.protect, requestCloseITCase);
router.post('/:id/approve-close', auth.protect, auth.itOnly, approveCloseITCase);
router.post('/:id/decline-close', auth.protect, auth.itOnly, declineCloseITCase);
router.put('/:id', auth.protect, updateITCase);
router.delete('/:id', auth.protect, deleteITCase);

module.exports = router;
