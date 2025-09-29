const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const scheduleController = require('../controllers/scheduleController');

// Admin or IT Officer can manage; any authenticated can list their own
const adminOrIt = (req, res, next) => {
  const role = req.user?.role;
  console.log('Schedule route auth check:', { role, userId: req.user?.id });
  if (role === 'Admin' || role === 'IT Officer') return next();
  return res.status(403).json({ message: 'Access denied' });
};

router.get('/', protect, scheduleController.listSchedules);
router.post('/', protect, adminOrIt, scheduleController.upsertSchedule);
router.put('/:id/remark', protect, scheduleController.updateScheduleRemark);
router.put('/:id/reassign', protect, adminOrIt, scheduleController.reassignSchedule);
router.delete('/:id', protect, adminOrIt, scheduleController.deleteSchedule);

module.exports = router;


