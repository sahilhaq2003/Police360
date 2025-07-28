const mongoose = require('mongoose');

const OfficerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  officerId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  station: { type: String, required: true },
  role: {
    type: String,
    enum: ['Officer', 'Inspector', 'Admin'],
    default: 'Officer'
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Officer', OfficerSchema);
