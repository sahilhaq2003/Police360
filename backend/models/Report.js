const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  // Basic Information
  reportType: {
    type: String,
    required: true,
    enum: ['eCrime', 'Tourist Police', 'Police Report Inquiry', 'File Criminal Complaint', 'Criminal Status of Financial Cases', 'Unknown Accident Report', 'Reporting Vehicle Obstruction', 'Traffic Violations Copy', 'Change Vehicle Color', 'Traffic Fines Installment', 'Event Permit', 'Photography Permit', 'Sailing Permit', 'Road Closure Permit', 'Detainee Visit Request', 'Police Museum Visit Permit', 'Inmate Visit Permit', 'Traffic Status Certificate', 'Lost Item Certificate', 'Gold Management Platform', 'Human Trafficking Victims', 'File a Labor Complaint', 'Child and Women Protection', 'Home Security', 'Suggestion', 'Feedback']
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
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
    type: Number,
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

    // Additional Fields
  estimatedLoss: {
    type: Number,
    default: 0
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
});


module.exports = mongoose.model('Report', ReportSchema);