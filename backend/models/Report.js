const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ReportSchema = new mongoose.Schema({
  // Basic Information
  reportType: {
    type: String,
    required: true,
    enum: ['eCrime', 'Tourist Police', 'Police Report Inquiry', 'File Criminal Complaint', 'Criminal Status of Financial Cases', 'Unknown Accident Report', 'Reporting Vehicle Obstruction', 'Traffic Violations Copy', 'Change Vehicle Color', 'Traffic Fines Installment', 'Event Permit', 'Photography Permit', 'Sailing Permit', 'Road Closure Permit', 'Detainee Visit Request', 'Police Museum Visit Permit', 'Inmate Visit Permit', 'Traffic Status Certificate', 'Lost Item Certificate', 'Gold Management Platform', 'Human Trafficking Victims', 'File a Labor Complaint', 'Child and Women Protection', 'Home Security', 'Suggestion', 'Feedback']
  },
  
  // Reporter Information
  reporterName: {
    type: String,
    required: true,
    trim: true
  },
  reporterEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  reporterPhone: {
    type: String,
    required: true,
    trim: true
  },
  reporterAddress: {
    type: String,
    required: true,
    trim: true
  },
  reporterIdNumber: {
    type: String,
    required: true,
    trim: true
  },
  reporterIdType: {
    type: String,
    required: true,
    enum: ['National ID', 'Passport', 'Driving License', 'Other']
  },
  
  // Incident Details
  incidentDate: {
    type: Date,
    required: true
  },
  incidentLocation: {
    type: String,
    required: true,
    trim: true
  },
  incidentDescription: {
    type: String,
    required: true,
    trim: true
  },
  
  // Additional Details
  witnesses: [{
    name: String,
    phone: String,
    address: String
  }],
  
  suspects: [{
    name: String,
    description: String,
    address: String
  }],
  
  // Evidence
  evidence: [{
    type: {
      type: String,
      enum: ['Photo', 'Video', 'Document', 'Audio', 'Other']
    },
    description: String,
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and Processing
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'
  },
  
  // Tracking
  reportNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Additional Fields
  estimatedLoss: {
    type: Number,
    default: 0
  },
  
  insuranceInvolved: {
    type: Boolean,
    default: false
  },
  
  insuranceDetails: {
    company: String,
    policyNumber: String,
    contactPerson: String,
    contactPhone: String
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Comments and Notes
  comments: [{
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Confidentiality
  isConfidential: {
    type: Boolean,
    default: false
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'
  },
  
  verifiedAt: Date
}, {
  timestamps: true
});

// Generate report number before saving
ReportSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.reportNumber) {
      const year = new Date().getFullYear();
      const count = await mongoose.model('Report').countDocuments({
        reportNumber: new RegExp(`^REP-${year}-`)
      });
      this.reportNumber = `REP-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add pagination plugin
ReportSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Report', ReportSchema); 