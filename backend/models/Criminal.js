const mongoose = require('mongoose');

const CriminalSchema = new mongoose.Schema({
    // Auto-generated IDs
    fileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    recordId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    
    // Basic Info
    criminalId: {
        type: String,
        required: true,
        trim: true,
    },
    nic: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    aliases: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female'],
    },
    citizen: {
        type: String,
        required: true,
        trim: true,
    },
    
    // Physical Description
    height: {
        type: Number,
        min: 50,
        max: 250,
    },
    weight: {
        type: Number,
        min: 20,
        max: 250,
    },
    eyeColor: {
        type: String,
        trim: true,
    },
    hairColor: {
        type: String,
        trim: true,
    },
    maritalStatus: {
        type: String,
        trim: true,
    },
    
    // Criminal Status & Related Fields
    criminalStatus: {
        type: String,
        required: true,
        enum: ['wanted', 'arrested', 'in prison', 'released'],
    },
    rewardPrice: {
        type: Number,
        min: 0,
    },
    arrestDate: {
        type: Date,
    },
    prisonDays: {
        type: Number,
        min: 1,
    },
    releaseDate: {
        type: Date,
    },
    
    // Date of Birth
    dob: {
        day: { type: Number, min: 1, max: 31 },
        month: { type: Number, min: 1, max: 12 },
        year: { type: Number, min: 1900, max: new Date().getFullYear() },
    },
    
    // Additional Info
    otherInfo: {
        type: String,
        trim: true,
    },
    crimeInfo: {
        type: String,
        trim: true,
    },
    
    // Arrest & Sentencing Records
    arrests: [{
        date: { type: Date },
        offenseCode: { type: String, trim: true },
        institution: { type: String, trim: true },
        charge: { type: String, trim: true },
        term: { type: String, trim: true },
    }],
    
    // Media Files
    photo: {
        type: String, // URL or file path
    },
    fingerprints: [{
        name: { type: String, trim: true },
        url: { type: String, trim: true },
    }],
    
    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer',
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Criminal', CriminalSchema);