const mongoose = require('mongoose');

const SuspectSchema = new mongoose.Schema({
  suspectId: { type: String, required: true, trim: true },
  nic: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  aliases: { type: String, trim: true },
  address: { type: String, trim: true },
  gender: { type: String, trim: true },
  citizen: { type: String, trim: true },
  suspectStatus: { type: String, enum: ['wanted','arrested','in prison','released'], default: 'wanted' },
  rewardPrice: { type: Number, min: 0 },
  arrestDate: { type: Date },
  prisonDays: { type: Number, min: 0 },
  releaseDate: { type: Date },
  dob: { day: Number, month: Number, year: Number },
  otherInfo: { type: String, trim: true },
  crimeInfo: { type: String, trim: true },
  photo: { type: String },
  fingerprints: [{ name: String, url: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
}, { timestamps: true });

module.exports = mongoose.model('Suspect', SuspectSchema);
