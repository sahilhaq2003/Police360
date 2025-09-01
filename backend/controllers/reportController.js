const Report = require('../models/Report');
const Officer = require('../models/Officer');

// Create a new report
const createReport = async (req, res) => {
  try {
    console.log('Received report data:', req.body);
    console.log('Received files:', req.files);

    let {
      reportType,
      reporterName,
      reporterEmail,
      reporterPhone,
      reporterAddress,
      reporterIdNumber,
      reporterIdType,
      incidentDate,
      incidentLocation,
      incidentDescription,
      witnesses,
      suspects,
      estimatedLoss,
      insuranceInvolved,
      insuranceDetails,
      isConfidential,
      priority
    } = req.body;

    // Parse JSON strings if they come from FormData
    if (typeof witnesses === 'string') {
      try {
        witnesses = JSON.parse(witnesses);
      } catch (e) {
        console.log('Error parsing witnesses:', e);
        witnesses = [];
      }
    }

    if (typeof suspects === 'string') {
      try {
        suspects = JSON.parse(suspects);
      } catch (e) {
        console.log('Error parsing suspects:', e);
        suspects = [];
      }
    }

    if (typeof insuranceDetails === 'string') {
      try {
        insuranceDetails = JSON.parse(insuranceDetails);
      } catch (e) {
        console.log('Error parsing insuranceDetails:', e);
        insuranceDetails = {};
      }
    }

    // Convert string values to appropriate types
    if (typeof estimatedLoss === 'string') {
      estimatedLoss = parseFloat(estimatedLoss) || 0;
    }

    if (typeof insuranceInvolved === 'string') {
      insuranceInvolved = insuranceInvolved === 'true';
    }

    if (typeof isConfidential === 'string') {
      isConfidential = isConfidential === 'true';
    }

    // Validate required fields
    if (!reportType || !reporterName || !reporterEmail || !reporterPhone || !reporterAddress || !reporterIdNumber || !reporterIdType || !incidentDate || !incidentLocation || !incidentDescription) {
      console.log('Missing required fields:', { reportType, reporterName, reporterEmail, reporterPhone, reporterAddress, reporterIdNumber, reporterIdType, incidentDate, incidentLocation, incidentDescription });
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Handle evidence files if uploaded
    const evidence = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const evidenceItem = {
          type: req.body[`evidence[${index}][type]`] || 'Other',
          description: req.body[`evidence[${index}][description]`] || '',
          fileName: file.originalname,
          fileSize: file.size,
          fileUrl: file.path,
          uploadedAt: new Date()
        };
        evidence.push(evidenceItem);
      });
    }

    // Create new report
    const report = new Report({
      reportType,
      reporterName,
      reporterEmail,
      reporterPhone,
      reporterAddress,
      reporterIdNumber,
      reporterIdType,
      incidentDate,
      incidentLocation,
      incidentDescription,
      witnesses: witnesses || [],
      suspects: suspects || [],
      evidence: evidence,
      estimatedLoss: estimatedLoss || 0,
      insuranceInvolved: insuranceInvolved || false,
      insuranceDetails: insuranceDetails || {},
      isConfidential: isConfidential || false,
      priority: priority || 'Medium'
    });

    console.log('Saving report:', report);
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportNumber: report.reportNumber,
        reportId: report._id,
        status: report.status
      }
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
};

// Get all reports (with pagination and filtering)
const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      reportType,
      priority,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (reportType) query.reportType = reportType;
    if (priority) query.priority = priority;
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { reportNumber: { $regex: search, $options: 'i' } },
        { reporterName: { $regex: search, $options: 'i' } },
        { reporterEmail: { $regex: search, $options: 'i' } },
        { incidentLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { submittedAt: -1 },
      populate: [
        { path: 'assignedOfficer', select: 'name officerId email' },
        { path: 'verifiedBy', select: 'name officerId' }
      ]
    };

    const reports = await Report.paginate(query, options);

    res.json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Get a single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('assignedOfficer', 'name officerId email')
      .populate('verifiedBy', 'name officerId')
      .populate('comments.officer', 'name officerId');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedOfficer, priority, comments } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update fields
    if (status) report.status = status;
    if (assignedOfficer) report.assignedOfficer = assignedOfficer;
    if (priority) report.priority = priority;
    if (comments) {
      report.comments.push({
        officer: req.user.id, // Assuming user is authenticated
        comment: comments
      });
    }

    report.lastUpdated = new Date();
    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });

  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
};

// Upload evidence files
const uploadEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { evidenceType, description } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const uploadedEvidence = [];

    for (const file of files) {
      const evidence = {
        type: evidenceType || 'Other',
        description: description || '',
        fileName: file.originalname,
        fileSize: file.size,
        fileUrl: file.path || file.location, // Adjust based on your file storage
        uploadedAt: new Date()
      };

      uploadedEvidence.push(evidence);
    }

    report.evidence.push(...uploadedEvidence);
    await report.save();

    res.json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: uploadedEvidence
    });

  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ message: 'Error uploading evidence', error: error.message });
  }
};

// Delete evidence
const deleteEvidence = async (req, res) => {
  try {
    const { id, evidenceId } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.evidence = report.evidence.filter(evidence => evidence._id.toString() !== evidenceId);
    await report.save();

    res.json({
      success: true,
      message: 'Evidence deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({ message: 'Error deleting evidence', error: error.message });
  }
};

// Get reports by status
const getReportsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = { status };
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { submittedAt: -1 },
      populate: { path: 'assignedOfficer', select: 'name officerId email' }
    };

    const reports = await Report.paginate(query, options);

    res.json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error('Error fetching reports by status:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Get report statistics
const getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await Report.countDocuments();
    const todayReports = await Report.countDocuments({
      submittedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    const priorityStats = await Report.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        totalReports,
        todayReports,
        priorityStats
      }
    });

  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Verify report
const verifyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, comments } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.isVerified = isVerified;
    report.verifiedBy = req.user.id; // Assuming user is authenticated
    report.verifiedAt = new Date();

    if (comments) {
      report.comments.push({
        officer: req.user.id,
        comment: comments
      });
    }

    await report.save();

    res.json({
      success: true,
      message: 'Report verification updated successfully',
      data: report
    });

  } catch (error) {
    console.error('Error verifying report:', error);
    res.status(500).json({ message: 'Error verifying report', error: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  uploadEvidence,
  deleteEvidence,
  getReportsByStatus,
  getReportStats,
  verifyReport
}; 