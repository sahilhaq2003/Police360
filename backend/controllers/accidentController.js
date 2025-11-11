const Accident = require('../models/AccidentModel');
const Officer = require('../models/Officer');
const { nanoid } = require('nanoid');

function maybeCreateInsuranceRef(victim) {
  if (!victim) return undefined;
  if (!victim.insuranceCompany) return undefined;

  return `INS-${Math.random().toString().slice(2, 8)}`;
}

// --- Validation helpers ---
const ALLOWED_TYPES = ['ROAD_ACCIDENT', 'FIRE', 'STRUCTURAL_COLLAPSE', 'OTHER'];
const SL_BOUNDS = {
  lat: { min: 5.916, max: 9.835 },
  lng: { min: 79.521, max: 81.879 },
};
const NIC_REGEX = /^(\d{9}[VvXx]|\d{12})$/;
const EMAIL_REGEX = /[^\s@]+@[^\s@]+\.[^\s@]+/;

function validateGeo(geo, errors) {
  if (!geo) return;
  const lat = Number(geo.lat);
  const lng = Number(geo.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    errors.push('geo.lat and geo.lng must be numeric');
    return;
  }
  if (
    lat < SL_BOUNDS.lat.min ||
    lat > SL_BOUNDS.lat.max ||
    lng < SL_BOUNDS.lng.min ||
    lng > SL_BOUNDS.lng.max
  ) {
    errors.push('geo coordinates must be within Sri Lanka bounds');
  }
}

function validateVictim(victim, errors, isUpdate) {
  if (!victim) return;
  if (victim.email && !EMAIL_REGEX.test(String(victim.email))) {
    errors.push('victim.email must be a valid email');
  }
  if (victim.phone && String(victim.phone).replace(/\D/g, '').length < 7) {
    errors.push('victim.phone must be a valid phone number');
  }
}

function validateVehicle(vehicle, errors) {
  if (!vehicle) return;
  // basic type checks (all optional)
  ['plateNo', 'make', 'model', 'color', 'ownerNIC'].forEach((k) => {
    if (vehicle[k] != null && typeof vehicle[k] !== 'string')
      errors.push(`vehicle.${k} must be a string`);
  });
}

function validateEvidence(evidence, errors) {
  if (evidence == null) return;
  if (!Array.isArray(evidence)) {
    errors.push('evidence must be an array of strings');
    return;
  }
  if (evidence.some((e) => typeof e !== 'string')) {
    errors.push('evidence must contain only string items');
  }
}

function validateAccidentPayload(body, isUpdate = false) {
  const errors = [];
  // required on create
  if (!isUpdate) {
    if (!body.locationText || !String(body.locationText).trim())
      errors.push('locationText is required');
    if (!body.accidentType) errors.push('accidentType is required');
  }

  if (body.accidentType && !ALLOWED_TYPES.includes(body.accidentType)) {
    errors.push(`accidentType must be one of: ${ALLOWED_TYPES.join(', ')}`);
  }

  if (body.isEmergency != null && typeof body.isEmergency !== 'boolean') {
    errors.push('isEmergency must be a boolean');
  }

  if (body.nic && !NIC_REGEX.test(String(body.nic))) {
    errors.push('nic must be 9 digits + V/X or 12 digits');
  }

  validateGeo(body.geo, errors);
  validateVictim(body.victim, errors, isUpdate);
  validateVehicle(body.vehicle, errors);
  validateEvidence(body.evidence, errors);

  return errors;
}

// POST /api/accidents/report
exports.reportAccident = async (req, res) => {
  try {
    const trackingId = `ACC-${nanoid(8).toUpperCase()}`;

    const body = { ...req.body, trackingId };

    // validate input
    const errors = validateAccidentPayload(body, false);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // insurance ref generation
    if (
      body.victim &&
      body.victim.insuranceCompany &&
      !body.victim.insuranceRefNo
    ) {
      body.victim.insuranceRefNo = maybeCreateInsuranceRef(body.victim);
    }

    const doc = await Accident.create(body);

    return res.status(201).json({
      message: 'Accident reported successfully',
      trackingId: doc.trackingId,
      insuranceRefNo: doc?.victim?.insuranceRefNo || null,
      id: doc._id,
    });
  } catch (err) {
    console.error('reportAccident error:', err);
    return res.status(400).json({ error: err.message });
  }
};

// GET /api/accidents/track/:trackingId
exports.getByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const doc = await Accident.findOne({ trackingId });
    if (!doc) return res.status(404).json({ message: 'Not found' });

    return res.json({
      trackingId: doc.trackingId,
      status: doc.status,
      lastUpdated: doc.updatedAt,
      createdAt: doc.createdAt,
      notesCount: doc.investigationNotes?.length || 0,
      investigationNotes: doc.investigationNotes || [],
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// GET /api/accidents  (officers only, list with filters)
exports.listAccidents = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, q, assignedToMe, assignedOfficer } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.accidentType = type;

    // Filter by assigned officer (support both methods)
    if (assignedToMe === 'true' && req.user?.id) {
      filter.assignedOfficer = req.user.id;
    } else if (assignedOfficer) {
      filter.assignedOfficer = assignedOfficer;
    }

    if (q) {
      filter.$or = [
        { trackingId: new RegExp(q, 'i') },
        { nic: new RegExp(q, 'i') },
        { locationText: new RegExp(q, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Accident.find(filter)
        .populate('assignedOfficer', 'name officerId email station role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Accident.countDocuments(filter),
    ]);

    return res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      items,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// GET /api/accidents/:id
exports.getAccident = async (req, res) => {
  try {
    const doc = await Accident.findById(req.params.id).populate(
      'assignedOfficer',
      'name officerId email station role'
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// PUT /api/accidents/:id
exports.updateAccident = async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };

    // validate input (partial allowed)
    const errors = validateAccidentPayload(update, true);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // if officer added insurance after the fact
    if (
      update.victim &&
      update.victim.insuranceCompany &&
      !update.victim.insuranceRefNo
    ) {
      update.victim.insuranceRefNo = maybeCreateInsuranceRef(update.victim);
    }

    const doc = await Accident.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// DELETE /api/accidents/:id  (officers only)
exports.deleteAccident = async (req, res) => {
  try {
    const doc = await Accident.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Accident deleted' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// POST /api/accidents/:id/notes  (officers only)
exports.addInvestigationNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'note is required' });
    }

    const doc = await Accident.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    doc.investigationNotes.push({
      note,
      addedBy: req.user?.name || String(req.user?._id || ''),
    });
    doc.updatedAt = new Date();
    await doc.save();

    return res.status(201).json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// POST /api/accidents/:id/assign  (officers/admin)
exports.assignOfficer = async (req, res) => {
  try {
    const { officerId } = req.body;
    if (!officerId)
      return res.status(400).json({ message: 'officerId is required' });

    const officer = await Officer.findById(officerId);
    if (!officer) return res.status(404).json({ message: 'Officer not found' });
    if (!officer.isActive)
      return res.status(400).json({ message: 'Officer is not active' });
    if (officer.role !== 'Officer')
      return res.status(400).json({ message: 'Only Officers can be assigned' });

    const doc = await Accident.findByIdAndUpdate(
      req.params.id,
      {
        assignedOfficer: officer._id,
        status: 'UNDER_INVESTIGATION',
        updatedAt: new Date(),
      },
      { new: true }
    ).populate('assignedOfficer', 'name officerId email station role');

    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getByInsuranceRef = async (req, res) => {
  try {
    let { company, ref } = req.query || {};
    console.log('Incoming query:', req.query);

    if (!company || !ref) {
      return res.status(400).json({ message: 'company and ref are required' });
    }

    const doc = await Accident.findOne({
      'victim.insuranceCompany': company.trim(),
      'victim.insuranceRefNo': ref.trim(),
    }).collation({ locale: 'en', strength: 2 });

    if (!doc) {
      console.log('No accident found for', company, ref);
      return res.status(404).json({ message: 'Not found' });
    }

    return res.json(doc);
  } catch (err) {
    console.error('getByInsuranceRef error:', err);
    return res
      .status(500)
      .json({ message: 'Server error', details: err.message });
  }
};

// PUT /api/accidents/:id/notes/:noteId
exports.updateInvestigationNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'note is required' });
    }

    const now = new Date();

    // Update the matched array element using the positional operator ($)
    const doc = await Accident.findOneAndUpdate(
      { _id: id, 'investigationNotes._id': noteId },
      {
        $set: {
          'investigationNotes.$.note': note.trim(),
          'investigationNotes.$.updatedAt': now,
          updatedAt: now, // bump parent doc too
        },
      },
      { new: true }
    );

    if (!doc)
      return res.status(404).json({ message: 'Note or Accident not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.deleteInvestigationNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const now = new Date();
    const doc = await Accident.findByIdAndUpdate(
      id,
      {
        $pull: { investigationNotes: { _id: noteId } },
        $set: { updatedAt: now },
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
