const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer',
    required: true,
  },
  type: {
    type: String,
    enum: ['Report Issue', 'Request Appointment'],
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Denied'],
    default: 'Pending',
  },
  replies: [
    {
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
      message: { type: String, trim: true, maxlength: 2000 },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  appointmentDate: { type: Date },
}, { timestamps: { createdAt: true, updatedAt: true } });

module.exports = mongoose.model('Request', RequestSchema);


