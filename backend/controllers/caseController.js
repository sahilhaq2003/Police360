const Case = require('../models/Case');
const Officer = require('../models/Officer');
const mongoose = require('mongoose');

// POST /api/cases - submit a new criminal complaint
exports.createCase = async (req, res) => {
  try {
    const {
      complainant,
      complaintDetails,
      attachments,
      idInfo,
      priority,
      estimatedLoss,
      additionalInfo,
    } = req.body;

    if (!complainant?.name || !complaintDetails?.typeOfComplaint) {
      return res.status(400).json({ message: 'Complainant name and type of complaint are required' });
    }

    const doc = await Case.create({
      complainant,
      complaintDetails,
      attachments: attachments || [],
      idInfo: idInfo || {},
      priority: priority || 'MEDIUM',
      estimatedLoss: estimatedLoss || '',
      additionalInfo: additionalInfo || {},
      createdBy: req.user?.id || null,
    });

    res.status(201).json({ success: true, id: doc._id, data: doc });
  } catch (err) {
    console.error('createCase error', err);
    res.status(500).json({ message: 'Failed to create case' });
  }
};

// GET /api/cases - list (supports query param assignedOfficer, status, unassigned)
exports.listCases = async (req, res) => {
  try {
    const { assignedOfficer, status, unassigned, q } = req.query;
    const filter = {};
    if (assignedOfficer) filter.assignedOfficer = assignedOfficer;
    if (status) filter.status = status;
    if (unassigned === 'true') filter.assignedOfficer = null;

    // search query across common text fields
    if (q && typeof q === 'string' && q.trim().length > 0) {
      const term = q.trim();
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const ors = [
        { 'complainant.name': re },
        { 'complaintDetails.typeOfComplaint': re },
        { 'complaintDetails.location': re },
        { 'complaintDetails.description': re },
      ];
      // if term is a valid ObjectId, allow search by exact _id
      if (mongoose.isValidObjectId(term)) {
        try {
          ors.unshift({ _id: mongoose.Types.ObjectId(term) });
        } catch (e) {
          // ignore
        }
      }
      filter.$or = ors;
    }

    const list = await Case.find(filter).populate('assignedOfficer', 'name officerId email role').sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('listCases error', err);
    res.status(500).json({ message: 'Failed to list cases' });
  }
};

// GET /api/cases/:id
exports.getCase = async (req, res) => {
  try {
    const doc = await Case.findById(req.params.id).populate('assignedOfficer', 'name officerId email role');
    if (!doc) return res.status(404).json({ message: 'Case not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get case' });
  }
};

// POST /api/cases/:id/assign - IT officer assigns an officer
exports.assignOfficer = async (req, res) => {
  try {
    const { officerId } = req.body;
    if (!officerId) return res.status(400).json({ message: 'officerId is required' });

    const officer = await Officer.findById(officerId);
    if (!officer) return res.status(404).json({ message: 'Officer not found' });
    if (officer.role !== 'Officer') return res.status(400).json({ message: 'Cannot assign admin or IT officer' });

    const doc = await Case.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });

    doc.assignedOfficer = officer._id;
    doc.status = 'ASSIGNED';
    await doc.save();

    res.json({ success: true, data: await doc.populate('assignedOfficer', 'name officerId email') });
  } catch (err) {
    console.error('assignOfficer error', err);
    res.status(500).json({ message: 'Failed to assign officer' });
  }
};

// POST /api/cases/:id/notes - assigned officer adds a note
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) return res.status(400).json({ message: 'Note is required' });

    const doc = await Case.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });

    // only assigned officer or IT/Admin can add note
    const uid = req.user?.id;
    if (doc.assignedOfficer && doc.assignedOfficer.toString() !== uid && req.user?.role !== 'IT Officer' && req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to add note' });
    }

    doc.investigationNotes.push({ author: req.user?.id, note: note.trim() });
    if (doc.status === 'ASSIGNED') doc.status = 'IN_PROGRESS';
    await doc.save();

    const populated = await doc.populate('investigationNotes.author', 'name officerId email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('addNote error', err);
    res.status(500).json({ message: 'Failed to add note' });
  }
};

// POST /api/cases/:id/close - assigned officer marks closed
exports.closeCase = async (req, res) => {
  try {
    const doc = await Case.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });
    const uid = req.user?.id;
    if (doc.assignedOfficer && doc.assignedOfficer.toString() !== uid && req.user?.role !== 'IT Officer' && req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to close case' });
    }

    doc.status = 'CLOSED';
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('closeCase error', err);
    res.status(500).json({ message: 'Failed to close case' });
  }
};

// PUT /api/cases/:id - update complaint (before assignment or by Admin/IT)
exports.updateCase = async (req, res) => {
  try {
    console.log('[CASE] updateCase called', { params: req.params, bodyKeys: Object.keys(req.body || {}) });
    const { id } = req.params;

    const doc = await Case.findById(id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });

    // Allow update only if NEW (not yet assigned) or Admin/IT role
    if (doc.status !== 'NEW' && req.user?.role !== 'Admin' && req.user?.role !== 'IT Officer') {
      return res.status(403).json({ message: 'You are not allowed to update this complaint' });
    }

    // Update allowed fields
    const {
      complainant,
      complaintDetails,
      attachments,
      idInfo,
      priority,
      estimatedLoss,
      additionalInfo,
    } = req.body;

    if (complainant) doc.complainant = complainant;
    if (complaintDetails) doc.complaintDetails = complaintDetails;
    if (attachments) doc.attachments = attachments;
    if (idInfo) doc.idInfo = idInfo;
    if (priority) doc.priority = priority;
    if (estimatedLoss) doc.estimatedLoss = estimatedLoss;
    if (additionalInfo) doc.additionalInfo = additionalInfo;

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error('updateCase error', err);
    res.status(500).json({ message: 'Failed to update case' });
  }
};


// (Duplicate earlier deleteCase removed - keep the permissive deleteCase below)

// DELETE /api/cases/:id - delete a case (Admin / IT or owner)
exports.deleteCase = async (req, res) => {
  try {
    const doc = await Case.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });

    const uid = req.user?.id;
    const role = req.user?.role;
    // allow Admin, IT Officer, or the user who created the case to delete
    if (role !== 'Admin' && role !== 'IT Officer' && (!doc.createdBy || doc.createdBy.toString() !== uid)) {
      return res.status(403).json({ message: 'Not authorized to delete this case' });
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    console.error('deleteCase error', err);
    res.status(500).json({ message: 'Failed to delete case' });
  }
};