const e = require('express');
const Report = require('../models/Report');


//Display all reports
const getAllReports = async(req,res,next) => {
  let Reports;
  //Get all reports
  try {
    reports = await Report.find();
  } catch (err) {
    console.log(err);
  }
  //not found
  if (!reports) {
    return res.status(404).json({ message: 'No reports found' });
  }
  //Display a specific report
  return res.status(200).json({ reports });
};

//data Insert
const createReport = async (req, res, next) => {
  const {
    reportType,
    priority,
    reporterName,
    reporterEmail,
    reporterPhone,
    reporterAddress,
    reporterIdNumber,
    reporterIdType,
    incidentDate,
    incidentLocation,
    incidentDescription,
    estimatedLoss,
    witnesses,
    suspects,
    evidence,
    insuranceInvolved,
    insuranceDetails
} = req.body;

  let reports;

  try {
    reports = new Report({
      reportType,
      priority,
      reporterName,
      reporterEmail,
      reporterPhone,
      reporterAddress,
      reporterIdNumber,
      reporterIdType,
      incidentDate,
      incidentLocation,
      incidentDescription,
      estimatedLoss,
      witnesses,
      suspects,
      evidence,
      insuranceInvolved,
      insuranceDetails
    });
    await reports.save();
  } catch (err) {
    console.log(err);
  }
  //not insert report
  if (!reports) {
    return res.status(500).json({ message: 'Failed to create report' });
  }

  return res.status(201).json({ reports });
};




//Get by ID
const getReportById = async (req, res, next) => {
  const reportId = req.params.id;
  let report;

  try {
    report = await Report.findById(reportId);
  } catch (err) {
    console.log(err);
  }
  //not found
  if (!report) {
    return res.status(404).json({ message: 'No report found' });
  }

  return res.status(200).json({ report });
};



//Update Report Details
const updateReport = async (req, res, next) => {

  const reportId = req.params.id;
  const {
    reportType,
    priority,
    reporterName,
    reporterEmail,
    reporterPhone,
    reporterAddress,
    reporterIdNumber,
    reporterIdType,
    incidentDate,
    incidentLocation,
    incidentDescription,
    estimatedLoss,
    witnesses,
    suspects,
    evidence,
    insuranceInvolved,
    insuranceDetails
} = req.body;

  let report;

  try {
    report = await Report.findByIdAndUpdate(reportId, {
      reportType: reportType,
      priority: priority,
      reporterName: reporterName,
      reporterEmail: reporterEmail,
      reporterPhone: reporterPhone,
      reporterAddress: reporterAddress,
      reporterIdNumber: reporterIdNumber,
      reporterIdType: reporterIdType,
      incidentDate: incidentDate,
      incidentLocation: incidentLocation,
      incidentDescription: incidentDescription,
      estimatedLoss: estimatedLoss,
      witnesses: witnesses,
      suspects: suspects,
      evidence: evidence,
      insuranceInvolved: insuranceInvolved,
      insuranceDetails: insuranceDetails
    });
    report = await report.save();
  } catch (err) {
    console.log(err);
  }
  //not found
  if (!report) {
    return res.status(404).json({ message: 'Unable to update report' });
  }

  return res.status(200).json({ report });
};


//Delete Report Details
const deleteReport = async (req, res, next) => {
  const reportId = req.params.id;
  let report;

  try {
    report = await Report.findByIdAndDelete(reportId);
  } catch (err) {
    console.log(err);
  }
  //not found
  if (!report) {
    return res.status(404).json({ message: 'Unable to delete report' });
  }

  return res.status(200).json({ message: 'Report deleted successfully' });
};

exports.getAllReports = getAllReports;
exports.createReport = createReport;
exports.getReportById = getReportById;
exports.updateReport = updateReport;
exports.deleteReport = deleteReport;