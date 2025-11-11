// scripts/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Officer = require('../models/Officer');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  const exists = await Officer.findOne({ username: 'admin' });
  if (exists) {
    console.log('Admin already exists.');
    return process.exit();
  }

  const hashed = await bcrypt.hash('police360', 10);
  const admin = new Officer({
    name: 'Admin',
    officerId: 'ADM001',
    email: 'police360@gmail.com',
    contactNumber: '0771234567',
    station: 'Colombo HQ',
    role: 'Admin',
    username: 'admin',
    password: hashed,
    isActive: true
  });

  await admin.save();
  console.log('Admin created successfully');
  process.exit();
}

createAdmin();
