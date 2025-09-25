const Accident = require('../models/AccidentModel');
const Officer = require('../models/Officer');
const { nanoid } = require('nanoid');

function maybeCreateInsuranceRef(victim) {
  if (!victim) return undefined;
  if (!victim.insuranceCompany) return undefined;

  return `INS-${Math.random().toString().slice(2, 8)}`;
}

// POST /api/accidents/report
exports.reportAccident = async (req, res) => {
  try {
    const trackingId = `ACC-${nanoid(8).toUpperCase()}`;

    const body = { ...req.body, trackingId };

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
    const { page = 1, limit = 20, status, type, q, assignedToMe } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.accidentType = type;

    // Filter by assigned officer
    if (assignedToMe === 'true' && req.user?.id) {
      filter.assignedOfficer = req.user.id;
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
