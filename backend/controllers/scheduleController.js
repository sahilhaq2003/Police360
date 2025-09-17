const Schedule = require('../models/Schedule');

// Create or update a schedule entry
exports.upsertSchedule = async (req, res) => {
  try {
    const { officer, date, shift, location, notes } = req.body;
    if (!officer || !date || !shift) return res.status(400).json({ message: 'officer, date and shift are required' });

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'Invalid date' });

    const saved = await Schedule.findOneAndUpdate(
      { officer, date: d },
      { officer, date: d, shift, location: location || '', notes: notes || '' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List schedules with filters
exports.listSchedules = async (req, res) => {
  try {
    const { officer, start, end, page = 1, pageSize = 50 } = req.query;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(200, Math.max(1, parseInt(pageSize)));

    const filter = {};
    if (officer) filter.officer = officer;
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }

    const skip = (p - 1) * ps;
    const [rows, total] = await Promise.all([
      Schedule.find(filter).populate('officer', 'name officerId role station').sort({ date: 1 }).skip(skip).limit(ps),
      Schedule.countDocuments(filter),
    ]);

    res.json({ data: rows, page: p, pageSize: ps, total, totalPages: Math.max(1, Math.ceil(total / ps)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a schedule entry
exports.deleteSchedule = async (req, res) => {
  try {
    const id = req.params.id;
    await Schedule.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


