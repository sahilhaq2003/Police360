const mongoose = require('mongoose');

const InvestigationNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    addedBy: String, // officer id or name
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

module.exports = InvestigationNoteSchema;
