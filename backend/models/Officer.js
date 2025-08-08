const mongoose = require('mongoose');

const OfficerSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  officerId:     { type: String, required: true, unique: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  station:       { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['Officer', 'IT Officer', 'Admin'],
    default: 'Officer',
  },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // hashed
  isActive: { type: Boolean, default: true },
  photo:    { type: String, default: '' },    // base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Officer', OfficerSchema);
