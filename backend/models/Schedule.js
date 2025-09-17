const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', required: true, index: true },
  date: { type: Date, required: true, index: true },
  shift: { type: String, required: true, trim: true }, // e.g., Morning, Evening, Night or 08:00-16:00
  location: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, maxlength: 1000, default: '' },
}, { timestamps: true });

ScheduleSchema.index({ officer: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('Schedule', ScheduleSchema);


