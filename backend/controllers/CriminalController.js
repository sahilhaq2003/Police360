const Criminal = require('../models/Criminal');

// Get all criminals
const getAllCriminals = async (req, res) => {
    try {
        const criminals = await Criminal.find();
        
        if (!criminals || criminals.length === 0) {
            return res.status(404).json({ message: 'No criminals found' });
        }

        res.status(200).json(criminals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new criminal
const addCriminal = async (req, res) => {
    try {
        const {
            fileNumber, recordId, criminalId, nic, name, aliases, address, 
            gender, citizen, height, weight, eyeColor, hairColor, 
            maritalStatus, criminalStatus, rewardPrice, arrestDate, 
            prisonDays, releaseDate, dob, otherInfo, crimeInfo, 
            arrests, photo, fingerprints
        } = req.body;

        const criminal = new Criminal({
            fileNumber, recordId, criminalId, nic, name, aliases, address,
            gender, citizen, height, weight, eyeColor, hairColor,
            maritalStatus, criminalStatus, rewardPrice, arrestDate,
            prisonDays, releaseDate, dob, otherInfo, crimeInfo,
            arrests, photo, fingerprints,
            createdBy: req.user.id // From auth middleware
        });

        await criminal.save();
        res.status(201).json({
            success: true,
            message: 'Criminal record created successfully',
            data: criminal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};

// Get criminal by ID
const getCriminalById = async (req, res) => {
    try {
        const criminal = await Criminal.findById(req.params.id);
        
        if (!criminal) {
            return res.status(404).json({ message: 'Criminal not found' });
        }

        res.status(200).json(criminal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update criminal
const updateCriminal = async (req, res) => {
    try {
        const criminal = await Criminal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!criminal) {
            return res.status(404).json({ message: 'Criminal not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Criminal record updated successfully',
            data: criminal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
};

// Delete criminal
const deleteCriminal = async (req, res) => {
    try {
        const criminal = await Criminal.findByIdAndDelete(req.params.id);

        if (!criminal) {
            return res.status(404).json({ message: 'Criminal not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Criminal record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload criminal photo
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo file uploaded'
            });
        }

        // Return the file path that can be used to access the photo
        const photoUrl = `/uploads/criminals/${req.file.filename}`;
        
        res.status(200).json({
            success: true,
            message: 'Photo uploaded successfully',
            photoUrl: photoUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading photo',
            error: error.message
        });
    }
};

module.exports = {
    getAllCriminals,
    addCriminal,
    getCriminalById,
    updateCriminal,
    deleteCriminal,
    uploadPhoto
};