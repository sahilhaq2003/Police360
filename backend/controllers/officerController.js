const Officer = require('../models/Officer');
const bcrypt = require('bcrypt');

// Admin creates new officer
exports.createOfficer = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newOfficer = new Officer({ ...rest, password: hashedPassword });
    const saved = await newOfficer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// View all active officers
exports.getAllOfficers = async (req, res) => {
  try {
    const officers = await Officer.find({ isActive: true });
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update officer
exports.updateOfficer = async (req, res) => {
  try {
    const updated = await Officer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft delete officer
exports.softDeleteOfficer = async (req, res) => {
  try {
    await Officer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Officer deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search officers
exports.searchOfficers = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await Officer.find({
      isActive: true,
      $or: [
        { name: new RegExp(query, 'i') },
        { officerId: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { contactNumber: new RegExp(query, 'i') },
        { role: new RegExp(query, 'i') },
        { station: new RegExp(query, 'i') }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
