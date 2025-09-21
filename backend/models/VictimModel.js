const mongoose = require('mongoose');

const VictimSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    email: String,
    address: String,
    insuranceCompany: String,
    insurancePolicyNo: String,
    insuranceRefNo: String,
  },
  { _id: false }
);

module.exports = VictimSchema;
