const Suspect = require('../models/Suspect');

// Get all suspects
const getAllSuspects = async (req, res) => {
  try {
    const suspects = await Suspect.find();

    if (!suspects || suspects.length === 0) {
      return res.status(404).json({ message: 'No suspects found' });
    }

    res.status(200).json(suspects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new suspect
const addSuspect = async (req, res) => {
  try {
    const {
      suspectId,
      nic,
      name,
      address,
      gender,
      citizen,
      suspectStatus,
      rewardPrice,
      arrestDate,
      prisonDays,
      releaseDate,
      dob,
      crimeInfo,
      photo,
      fingerprints,
    } = req.body;

    const suspect = new Suspect({
      suspectId,
      nic,
      name,
      address,
      gender,
      citizen,
      suspectStatus,
      rewardPrice,
      arrestDate,
      prisonDays,
      releaseDate,
      dob,
      crimeInfo,
      photo,
      fingerprints,
      createdBy: req.user?.id,
    });

    await suspect.save();
    res.status(201).json({
      success: true,
      message: 'Suspect record created successfully',
      data: suspect,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message,
    });
  }
};

// Get suspect by ID
const getSuspectById = async (req, res) => {
  try {
    const s = await Suspect.findById(req.params.id);

    if (!s) {
      return res.status(404).json({ message: 'Suspect not found' });
    }

    res.status(200).json(s);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update suspect
const updateSuspect = async (req, res) => {
  try {
    const s = await Suspect.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!s) {
      return res.status(404).json({ message: 'Suspect not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Suspect record updated successfully',
      data: s,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message,
    });
  }
};

// Delete suspect
const deleteSuspect = async (req, res) => {
  try {
    const s = await Suspect.findByIdAndDelete(req.params.id);

    if (!s) {
      return res.status(404).json({ message: 'Suspect not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Suspect record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllSuspects, addSuspect, getSuspectById, updateSuspect, deleteSuspect };
