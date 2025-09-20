const Reporting = require('../models/Reporting');

// Create new reporting
const createReporting = async (req, res) => {
  try {
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

    // Parse JSON fields (FormData sends strings)
    if (typeof witnesses === 'string') witnesses = JSON.parse(witnesses);
    if (typeof suspects === 'string') suspects = JSON.parse(suspects);
    if (typeof insuranceDetails === 'string') insuranceDetails = JSON.parse(insuranceDetails);

    // Handle evidence uploads
    const evidence = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        evidence.push({
          type: req.body[`evidence[${index}][type]`] || 'Other',
          description: req.body[`evidence[${index}][description]`] || '',
          fileName: file.originalname,
          fileSize: file.size,
          fileUrl: file.path,
          uploadedAt: new Date()
        });
      });
    }

    const reporting = new Reporting({
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
      evidence,
      estimatedLoss,
      insuranceInvolved,
      insuranceDetails,
      isConfidential,
      priority
    });

    await reporting.save();

    res.status(201).json({
      success: true,
      message: 'Reporting submitted successfully',
      data: { reportNumber: reporting.reportNumber, reportId: reporting._id }
    });

  } catch (err) {
    console.error('Error creating reporting:', err);
    res.status(500).json({ message: 'Error creating reporting', error: err.message });
  }
};

// Fetch all reporting
const getReportings = async (req, res) => {
  try {
    const reports = await Reporting.find().sort({ submittedAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reports', error: err.message });
  }
};

// Get reporting by ID
const getReportingById = async (req, res,next) => {
    const id = req.params.id;
    let reporting;
    
  try {
    reporting = await Reporting.findById(id);
    
  } catch (err) {
    console.error("Error fetching report by ID:", err);
    res.status(500).json({ success: false, message: "Error fetching report", error: err.message });
  }
  return res.status(200).json({ success: true, data: reporting });
};

// Update an existing report
const updateReporting = async (req, res,next) => {
    const id = req.params.id;
    const {
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

    let reportings;

    try {
        reportings = await Reporting.findByIdAndUpdate(id,
        {
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
            witnesses: typeof witnesses === 'string' ? JSON.parse(witnesses) : witnesses,
            suspects: typeof suspects === 'string' ? JSON.parse(suspects) : suspects,
            estimatedLoss,
            insuranceInvolved,
            insuranceDetails: typeof insuranceDetails === 'string' ? JSON.parse(insuranceDetails) : insuranceDetails,
            isConfidential,
            priority,
            lastUpdated: new Date()
        });
        reportings = await reportings.save();
    } catch (err) {
        console.log(err);
    }
    //not available
    if (!reportings) {
        return res.status(404).json({ success: false, message: "Report not found" });
    }
    return res.status(200).json({ success: true, message: "Report updated successfully", data: reportings });
};


//Delete a report
const deleteReporting = async (req, res,next) => {
    const id = req.params.id;

    let reporting;

    try {
        reporting = await Reporting.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }
    //not available
    if (!reporting) {
        return res.status(404).json({ success: false, message: "Report not found" });
    }
    return res.status(200).json({ success: true, message: "Report deleted successfully", data: reporting });
};


module.exports = { createReporting, getReportings, getReportingById, updateReporting, deleteReporting };
