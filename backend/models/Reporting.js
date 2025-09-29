const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ReportingSchema = new mongoose.Schema({
  reportType: { type: String, required: true },
  reporterName: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  reporterPhone: { type: String, required: true },
  reporterAddress: { type: String, required: true },
  reporterIdNumber: { type: String, required: true },
  reporterIdType: { type: String, required: true },
  incidentDate: { type: Date, required: true },
  incidentLocation: { type: String, required: true },
  incidentDescription: { type: String, required: true },

  witnesses: [{ name: String, phone: String, address: String }],
  suspects: [{ name: String, description: String, address: String }],

  evidence: [{
    type: String,
    description: String,
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],

  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },

  estimatedLoss: { type: Number, default: 0 },
  insuranceInvolved: { type: Boolean, default: false },
  insuranceDetails: {
    company: String,
    policyNumber: String,
    contactPerson: String,
    contactPhone: String
  },

  isConfidential: { type: Boolean, default: false },

  // Officer assignment
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },

  reportNumber: { type: String, unique: true, sparse: true },

  submittedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// auto-generate report number
ReportingSchema.pre('save', async function (next) {
  if (this.isNew && !this.reportNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Reporting').countDocuments({
      reportNumber: new RegExp(`^REP-${year}-`)
    });
    this.reportNumber = `REP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

ReportingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Reporting', ReportingSchema);
