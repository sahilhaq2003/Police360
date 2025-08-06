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

// Get all active officers (sorted by newest first)
exports.getAllOfficers = async (req, res) => {
  try {
    const officers = await Officer.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single officer by ID
exports.getOfficerById = async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id).select('-password');
    if (!officer || !officer.isActive) {
      return res.status(404).json({ message: 'Officer not found' });
    }
    res.status(200).json(officer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update officer details (without password update)
exports.updateOfficer = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    // Prevent password update via this route for security
    const updated = await Officer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ message: 'Officer not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft delete (deactivate) officer
exports.softDeleteOfficer = async (req, res) => {
  try {
    const result = await Officer.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!result) return res.status(404).json({ message: 'Officer not found' });
    res.json({ message: "Officer deactivated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search officers by keyword
exports.searchOfficers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query is required' });

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
    }).select('-password');

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
