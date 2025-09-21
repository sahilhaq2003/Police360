const mongoose = require('mongoose');
const VictimSchema = require('./VictimModel');
const VehicleSchema = require('./VehicleModel');
const InvestigationNoteSchema = require('./InvestigationNoteModel');

const AccidentSchema = new mongoose.Schema(
  {
    trackingId: { type: String, unique: true, required: true },
    accidentType: {
      type: String,
      required: true,
      enum: ['ROAD_ACCIDENT', 'FIRE', 'STRUCTURAL_COLLAPSE', 'OTHER'],
      default: 'OTHER',
    },
    isEmergency: { type: Boolean, default: false },

    // Reporter basics
    nic: String,
    locationText: { type: String, required: true },
    geo: {
      lat: Number,
      lng: Number,
    },

    evidence: [{ type: String }], // photo/video file paths

    // optional
    victim: VictimSchema,
    vehicle: VehicleSchema,

    status: {
      type: String,
      enum: ['REPORTED', 'UNDER_INVESTIGATION', 'CLOSED'],
      default: 'REPORTED',
      index: true,
    },

    investigationNotes: [InvestigationNoteSchema],

    // assignment
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

AccidentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Accident', AccidentSchema);
