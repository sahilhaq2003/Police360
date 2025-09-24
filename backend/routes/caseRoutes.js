const express = require('express');
const router = express.Router();
const { updateCase } = require('../controllers/caseController');
const { deleteCase } = require("../controllers/caseController");
const {
  createCase,
  listCases,
  getCase,
  assignOfficer,
  addNote,
  closeCase,
} = require('../controllers/caseController');

const auth = require('../middlewares/authMiddleware');

// public: allow unauthenticated users to submit complaints
router.post('/', createCase);
router.get('/', auth.protect, listCases);
router.get('/:id', auth.protect, getCase);
router.post('/:id/assign', auth.protect, auth.itOnly, assignOfficer);
router.post('/:id/notes', auth.protect, addNote);
router.post('/:id/close', auth.protect, closeCase);
router.put('/:id', auth.protect, updateCase);
router.delete('/:id', auth.protect, deleteCase);

module.exports = router;
