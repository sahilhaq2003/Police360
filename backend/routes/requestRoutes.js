const express = require('express');
const router = express.Router();
const { protect, adminOnly, adminOrIt } = require('../middlewares/authMiddleware');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  addReply,
  deleteRequest,
} = require('../controllers/requestController');

// Officer: create request
router.post('/', protect, createRequest);

// Officer: get own requests
router.get('/my', protect, getMyRequests);

// Admin or IT: get all requests
router.get('/', protect, adminOrIt, getAllRequests);

// Admin or IT: update status
router.put('/:id', protect, adminOrIt, updateRequestStatus);

// Admin or IT: add reply
router.post('/:id/replies', protect, adminOrIt, addReply);

// Admin or IT: delete request
router.delete('/:id', protect, adminOrIt, deleteRequest);

module.exports = router;


