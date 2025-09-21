const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complainant: {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  complaintDetails: {
    typeOfComplaint: { type: String, required: true },
    incidentDate: { type: Date },
    location: { type: String, trim: true },
    description: { type: String },
  },
  attachments: [{ type: String }], // paths to uploads
  status: { type: String, enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED'], default: 'NEW' },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', default: null },
  investigationNotes: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
      note: { type: String },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', required: false, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Case', ComplaintSchema);
