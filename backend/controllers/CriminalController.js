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

        // Required field validation
        if (!criminalId || !nic || !name || !address || !gender || !criminalStatus) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: criminalId, nic, name, address, gender, criminalStatus'
            });
        }

        // NIC validation
        if (nic.length !== 12 || !/^\d{12}$/.test(nic)) {
            return res.status(400).json({
                success: false,
                message: 'NIC must be exactly 12 digits'
            });
        }

        // Criminal ID validation
        if (criminalId.length !== 6 || !/^\d{6}$/.test(criminalId)) {
            return res.status(400).json({
                success: false,
                message: 'Criminal ID must be exactly 6 digits'
            });
        }

        // Name validation
        if (name.length < 2 || name.length > 150) {
            return res.status(400).json({
                success: false,
                message: 'Name must be between 2-50 characters'
            });
        }

        // Address validation
        if (address.length < 10 || address.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'Address must be between 10-200 characters'
            });
        }

        // Address format validation - allow letters, numbers, spaces, commas, periods, hyphens, and forward slashes
        if (!/^[a-zA-Z0-9\s,.\-\/]+$/.test(address)) {
            return res.status(400).json({
                success: false,
                message: 'Address can only contain letters, numbers, spaces, commas, periods, hyphens, and forward slashes'
            });
        }

        // Gender validation
        if (!['male', 'female'].includes(gender.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Gender must be either male or female'
            });
        }

        // Criminal status validation
        if (!['wanted', 'arrested', 'in prison', 'released'].includes(criminalStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Criminal status must be: wanted, arrested, in prison, or released'
            });
        }

        // Height validation
        if (height !== undefined && height !== null && height !== '') {
            const heightNum = Number(height);
            if (isNaN(heightNum) || heightNum < 0 || heightNum > 250) {
                return res.status(400).json({
                    success: false,
                    message: 'Height must be between 0-250 cm'
                });
            }
        }

        // Weight validation
        if (weight !== undefined && weight !== null && weight !== '') {
            const weightNum = Number(weight);
            if (isNaN(weightNum) || weightNum < 0 || weightNum > 250) {
                return res.status(400).json({
                    success: false,
                    message: 'Weight must be between 0-250 kg'
                });
            }
        }

        // Status-specific validations
        if (criminalStatus === 'wanted' && rewardPrice !== undefined && rewardPrice !== null && rewardPrice !== '') {
            const rewardNum = Number(rewardPrice);
            if (isNaN(rewardNum) || rewardNum < 0 || rewardNum > 10000000) {
                return res.status(400).json({
                    success: false,
                    message: 'Reward price must be between 0 - 10,000,000 LKR'
                });
            }
        }

        if (criminalStatus === 'in prison' && prisonDays !== undefined && prisonDays !== null && prisonDays !== '') {
            const daysNum = Number(prisonDays);
            if (isNaN(daysNum) || daysNum < 1 || daysNum > 36500) {
                return res.status(400).json({
                    success: false,
                    message: 'Prison days must be between 1-36,500 days (100 years)'
                });
            }
        }

        // Date validations
        if (arrestDate && arrestDate !== '') {
            const arrestDateObj = new Date(arrestDate);
            if (isNaN(arrestDateObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid arrest date format'
                });
            }
            if (arrestDateObj > new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Arrest date cannot be in the future'
                });
            }
        }

        if (releaseDate && releaseDate !== '') {
            const releaseDateObj = new Date(releaseDate);
            if (isNaN(releaseDateObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid release date format'
                });
            }
            if (releaseDateObj > new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Release date cannot be in the future'
                });
            }
        }

        // DOB validation
        if (dob && dob.day && dob.month && dob.year) {
            const day = Number(dob.day);
            const month = Number(dob.month);
            const year = Number(dob.year);
            
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
                return res.status(400).json({
                    success: false,
                    message: 'Date of birth must contain valid numbers'
                });
            }

            const date = new Date(year, month - 1, day);
            const isValidDate = date.getDate() === day && 
                              date.getMonth() === month - 1 && 
                              date.getFullYear() === year;
            
            if (!isValidDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date of birth'
                });
            }

            const age = new Date().getFullYear() - year;
            if (age < 0 || age > 120) {
                return res.status(400).json({
                    success: false,
                    message: 'Age must be between 0-120 years'
                });
            }
        }

        // Check for duplicate criminal ID
        const existingCriminal = await Criminal.findOne({ criminalId });
        if (existingCriminal) {
            return res.status(400).json({
                success: false,
                message: 'Criminal ID already exists'
            });
        }

        // Check for duplicate NIC
        const existingNIC = await Criminal.findOne({ nic });
        if (existingNIC) {
            return res.status(400).json({
                success: false,
                message: 'NIC already exists'
            });
        }

        // Validate arrests array if provided
        if (arrests && Array.isArray(arrests)) {
            for (let i = 0; i < arrests.length; i++) {
                const arrest = arrests[i];
                if (arrest.date && arrest.date !== '') {
                    const arrestDate = new Date(arrest.date);
                    if (isNaN(arrestDate.getTime())) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid arrest date in row ${i + 1}`
                        });
                    }
                }
            }
        }

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
        const {
            criminalId, nic, name, address, gender, criminalStatus,
            height, weight, rewardPrice, arrestDate, prisonDays, 
            releaseDate, dob, arrests
        } = req.body;

        // Check if criminal exists
        const existingCriminal = await Criminal.findById(req.params.id);
        if (!existingCriminal) {
            return res.status(404).json({ 
                success: false,
                message: 'Criminal not found' 
            });
        }

        // NIC validation
        if (nic && (nic.length !== 12 || !/^\d{12}$/.test(nic))) {
            return res.status(400).json({
                success: false,
                message: 'NIC must be exactly 12 digits'
            });
        }

        // Criminal ID validation
        if (criminalId && (criminalId.length !== 6 || !/^\d{6}$/.test(criminalId))) {
            return res.status(400).json({
                success: false,
                message: 'Criminal ID must be exactly 6 digits'
            });
        }

        // Name validation
        if (name && (name.length < 2 || name.length > 50)) {
            return res.status(400).json({
                success: false,
                message: 'Name must be between 2-50 characters'
            });
        }

        // Address validation
        if (address && (address.length < 10 || address.length > 200)) {
            return res.status(400).json({
                success: false,
                message: 'Address must be between 10-200 characters'
            });
        }

        // Address format validation - allow letters, numbers, spaces, commas, periods, hyphens, and forward slashes
        if (address && !/^[a-zA-Z0-9\s,.\-\/]+$/.test(address)) {
            return res.status(400).json({
                success: false,
                message: 'Address can only contain letters, numbers, spaces, commas, periods, hyphens, and forward slashes'
            });
        }

        // Gender validation
        if (gender && !['male', 'female'].includes(gender.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Gender must be either male or female'
            });
        }

        // Criminal status validation
        if (criminalStatus && !['wanted', 'arrested', 'in prison', 'released'].includes(criminalStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Criminal status must be: wanted, arrested, in prison, or released'
            });
        }

        // Height validation
        if (height !== undefined && height !== null && height !== '') {
            const heightNum = Number(height);
            if (isNaN(heightNum) || heightNum < 0 || heightNum > 250) {
                return res.status(400).json({
                    success: false,
                    message: 'Height must be between 0-250 cm'
                });
            }
        }

        // Weight validation
        if (weight !== undefined && weight !== null && weight !== '') {
            const weightNum = Number(weight);
            if (isNaN(weightNum) || weightNum < 0 || weightNum > 250) {
                return res.status(400).json({
                    success: false,
                    message: 'Weight must be between 0-250 kg'
                });
            }
        }

        // Status-specific validations
        if (criminalStatus === 'wanted' && rewardPrice !== undefined && rewardPrice !== null && rewardPrice !== '') {
            const rewardNum = Number(rewardPrice);
            if (isNaN(rewardNum) || rewardNum < 0 || rewardNum > 10000000) {
                return res.status(400).json({
                    success: false,
                    message: 'Reward price must be between 0 - 10,000,000 LKR'
                });
            }
        }

        if (criminalStatus === 'in prison' && prisonDays !== undefined && prisonDays !== null && prisonDays !== '') {
            const daysNum = Number(prisonDays);
            if (isNaN(daysNum) || daysNum < 1 || daysNum > 36500) {
                return res.status(400).json({
                    success: false,
                    message: 'Prison days must be between 1-36,500 days (100 years)'
                });
            }
        }

        // Date validations
        if (arrestDate && arrestDate !== '') {
            const arrestDateObj = new Date(arrestDate);
            if (isNaN(arrestDateObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid arrest date format'
                });
            }
            if (arrestDateObj > new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Arrest date cannot be in the future'
                });
            }
        }

        if (releaseDate && releaseDate !== '') {
            const releaseDateObj = new Date(releaseDate);
            if (isNaN(releaseDateObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid release date format'
                });
            }
            if (releaseDateObj > new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Release date cannot be in the future'
                });
            }
        }

        // DOB validation
        if (dob && dob.day && dob.month && dob.year) {
            const day = Number(dob.day);
            const month = Number(dob.month);
            const year = Number(dob.year);
            
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
                return res.status(400).json({
                    success: false,
                    message: 'Date of birth must contain valid numbers'
                });
            }

            const date = new Date(year, month - 1, day);
            const isValidDate = date.getDate() === day && 
                              date.getMonth() === month - 1 && 
                              date.getFullYear() === year;
            
            if (!isValidDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date of birth'
                });
            }

            const age = new Date().getFullYear() - year;
            if (age < 0 || age > 120) {
                return res.status(400).json({
                    success: false,
                    message: 'Age must be between 0-120 years'
                });
            }
        }

        // Check for duplicate criminal ID (excluding current record)
        if (criminalId) {
            const duplicateCriminal = await Criminal.findOne({ 
                criminalId, 
                _id: { $ne: req.params.id } 
            });
            if (duplicateCriminal) {
                return res.status(400).json({
                    success: false,
                    message: 'Criminal ID already exists'
                });
            }
        }

        // Check for duplicate NIC (excluding current record)
        if (nic) {
            const duplicateNIC = await Criminal.findOne({ 
                nic, 
                _id: { $ne: req.params.id } 
            });
            if (duplicateNIC) {
                return res.status(400).json({
                    success: false,
                    message: 'NIC already exists'
                });
            }
        }

        // Validate arrests array if provided
        if (arrests && Array.isArray(arrests)) {
            for (let i = 0; i < arrests.length; i++) {
                const arrest = arrests[i];
                if (arrest.date && arrest.date !== '') {
                    const arrestDate = new Date(arrest.date);
                    if (isNaN(arrestDate.getTime())) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid arrest date in row ${i + 1}`
                        });
                    }
                }
            }
        }

        const criminal = await Criminal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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

module.exports = {
    getAllCriminals,
    addCriminal,
    getCriminalById,
    updateCriminal,
    deleteCriminal
};