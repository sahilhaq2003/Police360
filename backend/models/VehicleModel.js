const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    plateNo: String,
    make: String,
    model: String,
    color: String,
    ownerNIC: String,
  },
  { _id: false }
);

module.exports = VehicleSchema;
