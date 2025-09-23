const Suspect = require('../models/Suspect');

const getAllSuspects = async (req, res) => {
  try {
    const suspects = await Suspect.find();
    res.status(200).json(suspects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addSuspect = async (req, res) => {
  try {
    const suspect = new Suspect({ ...req.body, createdBy: req.user?.id });
    await suspect.save();
    res.status(201).json({ success: true, data: suspect });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getSuspectById = async (req, res) => {
  try {
    const s = await Suspect.findById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Suspect not found' });
    res.status(200).json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSuspect = async (req, res) => {
  try {
    const s = await Suspect.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ message: 'Suspect not found' });
    res.status(200).json({ success: true, data: s });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

const deleteSuspect = async (req, res) => {
  try {
    const s = await Suspect.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: 'Suspect not found' });
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllSuspects, addSuspect, getSuspectById, updateSuspect, deleteSuspect };
