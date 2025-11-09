const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  // Case ID for IT Officer created cases (different from complaint ID)
  caseId: { type: String, trim: true, unique: true, sparse: true },
  // Type to distinguish between complaints and cases
  type: { type: String, enum: ['COMPLAINT', 'CASE'], default: 'COMPLAINT' },
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
  attachments: [{ type: String }], // paths to uploads (or base64 strings)
  // new fields
  idInfo: {
    idType: { type: String, trim: true },
    idValue: { type: String, trim: true },
  },
  priority: { type: String, enum: ['LOW','MEDIUM','HIGH'], default: 'MEDIUM' },
  estimatedLoss: { type: String, trim: true },
  additionalInfo: {
    witnesses: [
      {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        id: { type: String, trim: true },
      }
    ],
    suspects: [
      {
        name: { type: String, trim: true },
        appearance: { type: String },
        photos: [{ type: String }],
      }
    ],
    evidence: [{ type: String }], // base64 or paths
  },
  status: { type: String, enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED', 'DECLINED', 'PENDING_CLOSE'], default: 'NEW' },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', default: null },
  declineReason: { type: String, trim: true },
  declinedAt: { type: Date },
  closeRequest: {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
    requestedAt: { type: Date },
    reason: { type: String, trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
    approvedAt: { type: Date },
    declinedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
    declinedAt: { type: Date },
    declineReason: { type: String, trim: true }
  },
  investigationNotes: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
      note: { type: String },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', required: false, default: null },
  // IT Officer specific fields
  itOfficerDetails: {
    caseAnalysis: { type: String, trim: true },
    technicalDetails: { type: String, trim: true },
    recommendedActions: { type: String, trim: true },
    urgencyLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    assignedDepartment: { type: String, trim: true },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
  },
  // Resource allocation
  resourceAllocation: {
    supportOfficers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Officer' }],
    vehicles: [{ type: String, trim: true }],
    firearms: [{ type: String, trim: true }],
  },
  // Single-use edit token for the creator (allows editing the freshly created case once without auth)
  editToken: { type: String, trim: true, default: null },
  editTokenUsed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Case', ComplaintSchema);


//this is a comment