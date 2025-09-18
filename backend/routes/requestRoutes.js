const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  addReply,
} = require('../controllers/requestController');

// Officer: create request
router.post('/', protect, createRequest);

// Officer: get own requests
router.get('/my', protect, getMyRequests);

// Admin: get all requests
router.get('/', protect, adminOnly, getAllRequests);

// Admin: update status
router.put('/:id', protect, adminOnly, updateRequestStatus);

// Admin: add reply
router.post('/:id/replies', protect, adminOnly, addReply);

module.exports = router;


