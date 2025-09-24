const express = require('express');
const router = express.Router();
//Insert Model
const Report = require('../models/Report');
//Insert Report Controller
const ReportController = require('../controllers/reportController');

router.get("/",ReportController.getAllReports);
router.post("/",ReportController.createReport);
router.get("/:id", ReportController.getReportById);
router.put("/:id", ReportController.updateReport);
router.delete("/:id", ReportController.deleteReport);

//export
module.exports = router;