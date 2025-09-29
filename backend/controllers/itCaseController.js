const ITCase = require('../models/ITCase');
const Officer = require('../models/Officer');
const mongoose = require('mongoose');

// POST /api/it-cases - submit a new IT Officer case
exports.createITCase = async (req, res) => {
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

    // Generate unique case ID
    const generateCaseId = async () => {
      const year = new Date().getFullYear();
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const caseId = `ITCASE-${year}-${randomNum}`;
        
        // Check if this case ID already exists
        const existingCase = await ITCase.findOne({ caseId });
        if (!existingCase) {
          isUnique = true;
          return caseId;
        }
        attempts++;
      }
      
      throw new Error('Unable to generate unique case ID after multiple attempts');
    };

    const caseId = await generateCaseId();

    console.log('Creating IT case with:', { 
      caseId, 
      userRole: req.user?.role,
      hasItOfficerDetails: !!itOfficerDetails
    });

    const doc = await ITCase.create({
      caseId,
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
    console.error('createITCase error:', err);
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
    
    res.status(500).json({ message: 'Failed to create IT case. Please try again.' });
  }
};

// GET /api/it-cases - list IT cases
exports.listITCases = async (req, res) => {
  try {
    const { status, q, page = 1, pageSize = 50, assignedOfficer } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (assignedOfficer) filter.assignedOfficer = assignedOfficer;
    if (q) {
      filter.$or = [
        { caseId: { $regex: q, $options: 'i' } },
        { 'complainant.name': { $regex: q, $options: 'i' } },
        { 'complaintDetails.typeOfComplaint': { $regex: q, $options: 'i' } },
        { 'itOfficerDetails.caseAnalysis': { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    
    const cases = await ITCase.find(filter)
      .populate([
        { path: 'assignedOfficer', select: 'name officerId department' },
        { path: 'createdBy', select: 'name officerId department' },
        { path: 'resourceAllocation.supportOfficers', select: 'name officerId department' },
        { path: 'closeRequest.requestedBy', select: 'name officerId department' },
        { path: 'closeRequest.approvedBy', select: 'name officerId department' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    const total = await ITCase.countDocuments(filter);

    res.json({
      success: true,
      data: cases,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        pages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (err) {
    console.error('listITCases error:', err);
    res.status(500).json({ message: 'Failed to fetch IT cases' });
  }
};

// POST /api/it-cases/:id/accept - accept an IT case
exports.acceptITCase = async (req, res) => {
  try {
    const { id } = req.params;
    const case_ = await ITCase.findByIdAndUpdate(
      id,
      { status: 'IN_PROGRESS' },
      { new: true }
    ).populate('assignedOfficer', 'name officerId department');
    
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json({ success: true, data: case_ });
  } catch (err) {
    console.error('acceptITCase error:', err);
    res.status(500).json({ message: 'Failed to accept case' });
  }
};

// POST /api/it-cases/:id/decline - decline an IT case
exports.declineITCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Decline reason is required' });
    }
    
    const case_ = await ITCase.findByIdAndUpdate(
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
    console.error('declineITCase error:', err);
    res.status(500).json({ message: 'Failed to decline case' });
  }
};

// GET /api/it-cases/:id - get single IT case
exports.getITCase = async (req, res) => {
  try {
    const { id } = req.params;
    
    const case_ = await ITCase.findById(id)
      .populate([
        { path: 'assignedOfficer', select: 'name officerId department' },
        { path: 'createdBy', select: 'name officerId department' },
        { path: 'resourceAllocation.supportOfficers', select: 'name officerId department' },
        { path: 'investigationNotes.author', select: 'name officerId' },
        { path: 'closeRequest.requestedBy', select: 'name officerId department' },
        { path: 'closeRequest.approvedBy', select: 'name officerId department' }
      ]);

    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    res.json({ success: true, data: case_ });
  } catch (err) {
    console.error('getITCase error:', err);
    res.status(500).json({ message: 'Failed to fetch IT case' });
  }
};

// POST /api/it-cases/:id/assign - assign officer to IT case
exports.assignOfficerToITCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    if (!officerId) {
      return res.status(400).json({ message: 'Officer ID is required' });
    }

    const case_ = await ITCase.findById(id);
    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    const officer = await Officer.findById(officerId);
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    case_.assignedOfficer = officerId;
    case_.status = 'ASSIGNED';
    await case_.save();

    res.json({ success: true, message: 'Officer assigned successfully' });
  } catch (err) {
    console.error('assignOfficerToITCase error:', err);
    res.status(500).json({ message: 'Failed to assign officer' });
  }
};

// POST /api/it-cases/:id/close - close IT case
exports.closeITCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const case_ = await ITCase.findById(id);
    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    case_.status = 'CLOSED';
    if (notes) {
      case_.investigationNotes.push({
        author: req.user?.id,
        note: notes
      });
    }
    
    await case_.save();

    res.json({ success: true, message: 'IT case closed successfully' });
  } catch (err) {
    console.error('closeITCase error:', err);
    res.status(500).json({ message: 'Failed to close IT case' });
  }
};

// PUT /api/it-cases/:id - update IT case
exports.updateITCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.caseId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const case_ = await ITCase.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedOfficer', 'name officerId department')
     .populate('createdBy', 'name officerId department')
     .populate('resourceAllocation.supportOfficers', 'name officerId department');

    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    res.json({ success: true, data: case_, message: 'IT case updated successfully' });
  } catch (err) {
    console.error('updateITCase error:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: `Validation error: ${errors.join(', ')}` });
    }
    
    res.status(500).json({ message: 'Failed to update IT case' });
  }
};

// POST /api/it-cases/:id/notes - assigned officer adds a note
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) return res.status(400).json({ message: 'Note is required' });

    const case_ = await ITCase.findById(req.params.id);
    if (!case_) return res.status(404).json({ message: 'IT case not found' });

    // only assigned officer or IT/Admin can add note
    const uid = req.user?.id;
    if (case_.assignedOfficer && case_.assignedOfficer.toString() !== uid && req.user?.role !== 'IT Officer' && req.user?.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to add note' });
    }

    case_.investigationNotes.push({ author: req.user?.id, note: note.trim() });
    if (case_.status === 'ASSIGNED') case_.status = 'IN_PROGRESS';
    await case_.save();

    const populated = await case_.populate('investigationNotes.author', 'name officerId email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('addNote error', err);
    res.status(500).json({ message: 'Failed to add note' });
  }
};

// POST /api/it-cases/:id/request-close - officer requests to close case
exports.requestCloseITCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const case_ = await ITCase.findById(id);
    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    // Check if officer is assigned to this case
    const uid = req.user?.id;
    if (case_.assignedOfficer && case_.assignedOfficer.toString() !== uid) {
      return res.status(403).json({ message: 'Not authorized to request closure' });
    }

    // Update case with close request
    case_.status = 'PENDING_CLOSE';
    case_.closeRequest = {
      requestedBy: req.user?.id,
      requestedAt: new Date(),
      reason: reason || 'Case investigation completed'
    };

    await case_.save();

    const populated = await case_.populate([
      { path: 'assignedOfficer', select: 'name officerId department' },
      { path: 'closeRequest.requestedBy', select: 'name officerId department' }
    ]);

    res.json({ success: true, data: populated, message: 'Close request submitted successfully' });
  } catch (err) {
    console.error('requestCloseITCase error:', err);
    res.status(500).json({ message: 'Failed to submit close request' });
  }
};

// POST /api/it-cases/:id/approve-close - IT officer approves close request
exports.approveCloseITCase = async (req, res) => {
  try {
    const { id } = req.params;

    const case_ = await ITCase.findById(id);
    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    if (case_.status !== 'PENDING_CLOSE') {
      return res.status(400).json({ message: 'No pending close request found' });
    }

    // Update case to closed
    case_.status = 'CLOSED';
    case_.closeRequest.approvedBy = req.user?.id;
    case_.closeRequest.approvedAt = new Date();

    await case_.save();

    const populated = await case_.populate([
      { path: 'assignedOfficer', select: 'name officerId department' },
      { path: 'closeRequest.requestedBy', select: 'name officerId department' },
      { path: 'closeRequest.approvedBy', select: 'name officerId department' }
    ]);

    res.json({ success: true, data: populated, message: 'Case closed successfully' });
  } catch (err) {
    console.error('approveCloseITCase error:', err);
    res.status(500).json({ message: 'Failed to approve close request' });
  }
};

// POST /api/it-cases/:id/decline-close - IT officer declines close request
exports.declineCloseITCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Decline reason is required' });
    }

    const case_ = await ITCase.findById(id);
    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    if (case_.status !== 'PENDING_CLOSE') {
      return res.status(400).json({ message: 'No pending close request found' });
    }

    // Revert case to previous status (IN_PROGRESS) and add decline info
    case_.status = 'IN_PROGRESS';
    case_.closeRequest.declinedBy = req.user?.id;
    case_.closeRequest.declinedAt = new Date();
    case_.closeRequest.declineReason = reason.trim();

    await case_.save();

    const populated = await case_.populate([
      { path: 'assignedOfficer', select: 'name officerId department' },
      { path: 'closeRequest.requestedBy', select: 'name officerId department' },
      { path: 'closeRequest.declinedBy', select: 'name officerId department' }
    ]);

    res.json({ success: true, data: populated, message: 'Close request declined successfully' });
  } catch (err) {
    console.error('declineCloseITCase error:', err);
    res.status(500).json({ message: 'Failed to decline close request' });
  }
};

// DELETE /api/it-cases/:id - delete IT case
exports.deleteITCase = async (req, res) => {
  try {
    const { id } = req.params;

    const case_ = await ITCase.findByIdAndDelete(id);
    if (!case_) {
      return res.status(404).json({ message: 'IT case not found' });
    }

    res.json({ success: true, message: 'IT case deleted successfully' });
  } catch (err) {
    console.error('deleteITCase error:', err);
    res.status(500).json({ message: 'Failed to delete IT case' });
  }
};
