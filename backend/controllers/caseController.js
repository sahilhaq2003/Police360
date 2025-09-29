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
      itOfficerDetails,
      resourceAllocation,
      assignedOfficer,
    } = req.body;

    if (!complainant?.name || !complaintDetails?.typeOfComplaint) {
      return res.status(400).json({ message: 'Complainant name and type of complaint are required' });
    }

    // generate a short single-use random token for the creator to edit once without logging in
    const makeToken = () => Math.random().toString(36).slice(2, 10);
    const editToken = makeToken();

    // Determine if this is an IT Officer created case
    // Check if user is IT Officer or if itOfficerDetails has meaningful content
    const isITCase = req.user?.role === 'IT Officer' || (
      itOfficerDetails && (
        itOfficerDetails.caseAnalysis || 
        itOfficerDetails.technicalDetails || 
        itOfficerDetails.recommendedActions ||
        itOfficerDetails.assignedDepartment ||
        (itOfficerDetails.urgencyLevel && itOfficerDetails.urgencyLevel !== 'MEDIUM') ||
        itOfficerDetails.followUpRequired
      )
    );

    // Generate case ID if this is an IT Officer created case
    let caseId = null;
    if (isITCase) {
      const year = new Date().getFullYear();
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        caseId = `CASE-${year}-${randomNum}`;
        
        // Check if this case ID already exists
        const existingCase = await Case.findOne({ caseId });
        if (!existingCase) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Unable to generate unique case ID after multiple attempts');
      }
    }

    console.log('Creating case with:', { 
      isITCase, 
      caseId, 
      type: isITCase ? 'CASE' : 'COMPLAINT',
      userRole: req.user?.role,
      hasItOfficerDetails: !!itOfficerDetails
    });

    const doc = await Case.create({
      caseId,
      type: isITCase ? 'CASE' : 'COMPLAINT',
      complainant,
      complaintDetails,
      attachments: attachments || [],
      idInfo: idInfo || {},
      priority: priority || 'MEDIUM',
      estimatedLoss: estimatedLoss || '',
      additionalInfo: additionalInfo || {},
      itOfficerDetails: itOfficerDetails || {},
      resourceAllocation: resourceAllocation || { supportOfficers: [], vehicles: [], firearms: [] },
      assignedOfficer: assignedOfficer || null,
      createdBy: req.user?.id || null,
      editToken,
    });

    // Return the edit token in response so the client can allow the creator to make one unauthenticated edit
    const out = doc.toObject ? doc.toObject() : doc;
    out.editToken = editToken;
    res.status(201).json({ success: true, id: doc._id, data: out, editToken });
  } catch (err) {
    console.error('createCase error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Case ID already exists. Please try again.' });
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({ message: `Validation error: ${errors.join(', ')}` });
    }
    
    // Handle case ID generation errors
    if (err.message.includes('Unable to generate unique case ID')) {
      return res.status(500).json({ message: 'Unable to generate unique case ID. Please try again.' });
    }
    
    res.status(500).json({ message: 'Failed to create case. Please try again.' });
  }
};

// POST /api/cases/:id/accept - accept a case
exports.acceptCase = async (req, res) => {
  try {
    const { id } = req.params;
    const case_ = await Case.findByIdAndUpdate(
      id,
      { status: 'IN_PROGRESS' },
      { new: true }
    ).populate('assignedOfficer', 'name officerId department');
    
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json({ success: true, data: case_ });
  } catch (err) {
    console.error('acceptCase error:', err);
    res.status(500).json({ message: 'Failed to accept case' });
  }
};

// POST /api/cases/:id/decline - decline a case
exports.declineCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Decline reason is required' });
    }
    
    const case_ = await Case.findByIdAndUpdate(
      id,
      { 
        status: 'DECLINED',
        declineReason: reason.trim(),
        declinedAt: new Date()
      },
      { new: true }
    ).populate('assignedOfficer', 'name officerId department');
    
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json({ success: true, data: case_ });
  } catch (err) {
    console.error('declineCase error:', err);
    res.status(500).json({ message: 'Failed to decline case' });
  }
};

// GET /api/cases - list (supports query param assignedOfficer, status, unassigned)
exports.listCases = async (req, res) => {
  try {
    const { assignedOfficer, status, unassigned, q, page = 1, pageSize = 50 } = req.query;
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

    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 50));
    const skip = (p - 1) * ps;

    const [list, total] = await Promise.all([
      Case.find(filter)
        .select('complainant complaintDetails status assignedOfficer createdAt')
        .populate('assignedOfficer', 'name officerId email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(ps),
      Case.countDocuments(filter),
    ]);
    res.json({ success: true, data: list, page: p, pageSize: ps, total });
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

// POST /api/cases/:id/request-close - officer requests to close case
exports.requestCloseCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const doc = await Case.findById(id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });

    // Check if officer is assigned to this case
    const uid = req.user?.id;
    if (doc.assignedOfficer && doc.assignedOfficer.toString() !== uid) {
      return res.status(403).json({ message: 'Not authorized to request closure' });
    }

    // Update case with close request
    doc.status = 'PENDING_CLOSE';
    doc.closeRequest = {
      requestedBy: req.user?.id,
      requestedAt: new Date(),
      reason: reason || 'Case investigation completed'
    };

    await doc.save();

    const populated = await doc.populate([
      { path: 'assignedOfficer', select: 'name officerId department' },
      { path: 'closeRequest.requestedBy', select: 'name officerId department' }
    ]);

    res.json({ success: true, data: populated, message: 'Close request submitted successfully' });
  } catch (err) {
    console.error('requestCloseCase error', err);
    res.status(500).json({ message: 'Failed to submit close request' });
  }
};

// POST /api/cases/:id/approve-close - IT officer approves close request
exports.approveCloseCase = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Case.findById(id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });

    if (doc.status !== 'PENDING_CLOSE') {
      return res.status(400).json({ message: 'No pending close request found' });
    }

    // Update case to closed
    doc.status = 'CLOSED';
    doc.closeRequest.approvedBy = req.user?.id;
    doc.closeRequest.approvedAt = new Date();

    await doc.save();

    const populated = await doc.populate([
      { path: 'assignedOfficer', select: 'name officerId department' },
      { path: 'closeRequest.requestedBy', select: 'name officerId department' },
      { path: 'closeRequest.approvedBy', select: 'name officerId department' }
    ]);

    res.json({ success: true, data: populated, message: 'Case closed successfully' });
  } catch (err) {
    console.error('approveCloseCase error', err);
    res.status(500).json({ message: 'Failed to approve close request' });
  }
};

// POST /api/cases/:id/decline-close - IT officer declines close request
exports.declineCloseCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Decline reason is required' });
    }

    const doc = await Case.findById(id);
    if (!doc) return res.status(404).json({ message: 'Case not found' });

    if (doc.status !== 'PENDING_CLOSE') {
      return res.status(400).json({ message: 'No pending close request found' });
    }

    // Revert case to previous status (IN_PROGRESS) and add decline info
    doc.status = 'IN_PROGRESS';
    doc.closeRequest.declinedBy = req.user?.id;
    doc.closeRequest.declinedAt = new Date();
    doc.closeRequest.declineReason = reason.trim();

    await doc.save();

    const populated = await doc.populate([
      { path: 'assignedOfficer', select: 'name officerId department' },
      { path: 'closeRequest.requestedBy', select: 'name officerId department' },
      { path: 'closeRequest.declinedBy', select: 'name officerId department' }
    ]);

    res.json({ success: true, data: populated, message: 'Close request declined successfully' });
  } catch (err) {
    console.error('declineCloseCase error', err);
    res.status(500).json({ message: 'Failed to decline close request' });
  }
};

// POST /api/cases/:id/close - assigned officer marks closed (legacy)
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

    // Allow update if:
    // - authenticated user with Admin/IT role, OR
    // - case is NEW and creator has provided the single-use edit token in X-Edit-Token header
    let allowed = false;
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'IT Officer')) allowed = true;

    // If not allowed yet, check for X-Edit-Token header for unauthenticated creator edit
    if (!allowed && (!req.user || !req.user.id)) {
      const provided = req.headers['x-edit-token'] || req.headers['x-edit-token'.toLowerCase()];
      if (provided && doc.editToken && !doc.editTokenUsed && doc.status === 'NEW' && provided === doc.editToken) {
        allowed = true;
        // mark token used later after successful save
        req._usedEditToken = true;
      }
    }

    if (!allowed) {
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
    // if update permitted by edit token, mark it used and clear the token
    if (req._usedEditToken) {
      doc.editTokenUsed = true;
      doc.editToken = null;
      await doc.save();
    }
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

exports.createCase = async (req, res) => {
  try {
    const doc = await Case.create({
      complainant: req.body.complainant,
      complaintDetails: req.body.complaintDetails,
      attachments: req.body.attachments || [],
      idInfo: req.body.idInfo || {},
      priority: req.body.priority || "MEDIUM",
      estimatedLoss: req.body.estimatedLoss || "",
      additionalInfo: req.body.additionalInfo || {},
      createdBy: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      id: doc._id,   // ✅ send back the new case ID
      data: doc
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create case" });
  }
};