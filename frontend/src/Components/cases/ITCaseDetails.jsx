import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import AdminHeader from '../AdminHeader/AdminHeader';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const complaintTypes = ["eCrime", "Tourist Police", "Police Report Inquiry", "File Complaint", "Criminal Status of Financial Cases", "Other"];
const idTypes = ["National ID", "Passport", "Driver's License", "Voter ID", "Other"];
const priorityOptions = ["LOW", "MEDIUM", "HIGH"];
const statusOptions = ["NEW", "ASSIGNED", "IN_PROGRESS", "CLOSED"];
const urgencyOptions = ["LOW", "MEDIUM", "HIGH"];

export default function ITCaseDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // Check if user came from admin dashboard
  const fromAdmin = location.state?.from === 'admin-dashboard';
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closeNotes, setCloseNotes] = useState("");
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const res = await axiosInstance.get(`/it-cases/${id}`);
      setCaseData(res.data.data);
    } catch (error) {
      console.error('Failed to fetch case details:', error);
      setBanner({ type: "error", message: "Failed to load case details" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (path, value) => {
    const keys = path.split(".");
    setCaseData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setBanner(null);

    try {
      const res = await axiosInstance.put(`/it-cases/${id}`, caseData);
      if (res.data.success) {
        setBanner({ type: "success", message: "Case updated successfully!" });
        setEditing(false);
        setCaseData(res.data.data);
      } else {
        setBanner({ type: "error", message: "Failed to update case" });
      }
    } catch (err) {
      console.error('Update error:', err);
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to update case"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setBanner(null);

    try {
      const res = await axiosInstance.delete(`/it-cases/${id}`);
      if (res.data.success) {
        setBanner({ type: "success", message: "Case deleted successfully!" });
        setTimeout(() => {
          navigate(fromAdmin ? "/admin/dashboard" : "/it/view-cases");
        }, 1500);
      } else {
        setBanner({ type: "error", message: "Failed to delete case" });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to delete case"
      });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCloseCase = async () => {
    setSaving(true);
    setBanner(null);

    try {
      const res = await axiosInstance.post(`/it-cases/${id}/close`, { notes: closeNotes });
      if (res.data.success) {
        setBanner({ type: "success", message: "Case closed successfully!" });
        setShowCloseConfirm(false);
        setCloseNotes("");
        fetchCaseDetails(); // Refresh to show updated status
      } else {
        setBanner({ type: "error", message: "Failed to close case" });
      }
    } catch (err) {
      console.error('Close error:', err);
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to close case"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApproveClose = async () => {
    setSaving(true);
    setBanner(null);

    try {
      const res = await axiosInstance.post(`/it-cases/${id}/approve-close`);
      if (res.data.success) {
        setBanner({ type: "success", message: "Close request approved successfully!" });
        fetchCaseDetails(); // Refresh to show updated status
      } else {
        setBanner({ type: "error", message: "Failed to approve close request" });
      }
    } catch (err) {
      console.error('Approve close error:', err);
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to approve close request"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeclineClose = async () => {
    if (!declineReason.trim()) {
      setBanner({ type: "error", message: "Please provide a reason for declining the close request" });
      return;
    }

    setSaving(true);
    setBanner(null);

    try {
      const res = await axiosInstance.post(`/it-cases/${id}/decline-close`, { reason: declineReason.trim() });
      if (res.data.success) {
        setBanner({ type: "success", message: "Close request declined successfully!" });
        setShowDeclineConfirm(false);
        setDeclineReason("");
        fetchCaseDetails(); // Refresh to show updated status
      } else {
        setBanner({ type: "error", message: "Failed to decline close request" });
      }
    } catch (err) {
      console.error('Decline close error:', err);
      setBanner({
        type: "error",
        message: err?.response?.data?.message || "Failed to decline close request"
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      case 'PENDING_CLOSE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const inputField = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:border-[#0B214A] focus:ring-2 focus:ring-[#0B214A]/20";

  // Export PDF function
  const exportPDF = () => {
    if (!caseData) return;

    const doc = new jsPDF();
    const brandPrimary = [11, 33, 74];
    const brandLight = [238, 242, 247];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const didDrawPage = () => {
      // Header
      doc.setFillColor(...brandPrimary);
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('Police360 - IT Case Report', 14, 18);

      // Subheader
      doc.setFillColor(...brandLight);
      doc.rect(0, 28, pageWidth, 10, 'F');
      doc.setTextColor(11, 33, 74);
      doc.setFontSize(9);
      doc.text(`Case ID: ${caseData.caseId}   |   Status: ${caseData.status}   |   Urgency: ${caseData.itOfficerDetails?.urgencyLevel || 'N/A'}`, 14, 35);

      // Footer
      const str = `Page ${doc.internal.getNumberOfPages()} | Generated ${new Date().toLocaleDateString()}`;
      doc.setTextColor(100);
      doc.setFontSize(8);
      doc.text(str, pageWidth - 14, pageHeight - 8, { align: 'right' });
    };

    // Case Summary
    autoTable(doc, {
      head: [['Field', 'Value']],
      body: [
        ['Case ID', caseData.caseId || 'N/A'],
        ['Status', caseData.status || 'N/A'],
        ['Priority', caseData.priority || 'N/A'],
        ['Lead Officer', caseData.assignedOfficer ? (caseData.assignedOfficer.name || 'Unknown') : 'Not Assigned'],
        ['Officer ID', caseData.assignedOfficer?.officerId || 'N/A'],
        ['Officer Department', caseData.assignedOfficer?.department || 'N/A'],
        ['Urgency Level', caseData.itOfficerDetails?.urgencyLevel || 'N/A'],
        ['Assigned Department', caseData.itOfficerDetails?.assignedDepartment || 'N/A'],
        ['Created Date', caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'],
        ['Last Updated', caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString() : 'N/A']
      ],
      margin: { top: 45, bottom: 18, left: 14, right: 14 },
      styles: { fontSize: 9, lineColor: brandLight, lineWidth: 0.1 },
      headStyles: { fontSize: 9, fillColor: brandPrimary, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      didDrawPage
    });

    // Complainant Information
    doc.addPage();
    didDrawPage();
    doc.setFontSize(12);
    doc.setTextColor(11, 33, 74);
    doc.text('Complainant Information', 14, 45);
    
    autoTable(doc, {
      head: [['Field', 'Value']],
      body: [
        ['Name', caseData.complainant?.name || 'N/A'],
        ['Phone', caseData.complainant?.phone || 'N/A'],
        ['Email', caseData.complainant?.email || 'N/A'],
        ['Address', caseData.complainant?.address || 'N/A']
      ],
      margin: { top: 50, bottom: 18, left: 14, right: 14 },
      styles: { fontSize: 9, lineColor: brandLight, lineWidth: 0.1 },
      headStyles: { fontSize: 9, fillColor: brandPrimary, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // Complaint Details
    doc.setFontSize(12);
    doc.setTextColor(11, 33, 74);
    doc.text('Complaint Details', 14, 95);
    
    autoTable(doc, {
      head: [['Field', 'Value']],
      body: [
        ['Type of Complaint', caseData.complaintDetails?.typeOfComplaint || 'N/A'],
        ['Incident Date', caseData.complaintDetails?.incidentDate ? new Date(caseData.complaintDetails.incidentDate).toLocaleDateString() : 'N/A'],
        ['Location', caseData.complaintDetails?.location || 'N/A'],
        ['Description', caseData.complaintDetails?.description || 'N/A']
      ],
      margin: { top: 100, bottom: 18, left: 14, right: 14 },
      styles: { fontSize: 9, lineColor: brandLight, lineWidth: 0.1 },
      headStyles: { fontSize: 9, fillColor: brandPrimary, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    // IT Officer Analysis
    if (caseData.itOfficerDetails) {
      doc.addPage();
      didDrawPage();
      doc.setFontSize(12);
      doc.setTextColor(11, 33, 74);
      doc.text('IT Officer Analysis', 14, 45);
      
      autoTable(doc, {
        head: [['Field', 'Value']],
        body: [
          ['Case Analysis', caseData.itOfficerDetails.caseAnalysis || 'N/A'],
          ['Technical Details', caseData.itOfficerDetails.technicalDetails || 'N/A'],
          ['Recommended Actions', caseData.itOfficerDetails.recommendedActions || 'N/A']
        ],
        margin: { top: 50, bottom: 18, left: 14, right: 14 },
        styles: { fontSize: 9, lineColor: brandLight, lineWidth: 0.1 },
        headStyles: { fontSize: 9, fillColor: brandPrimary, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [249, 250, 251] }
      });
    }

    // Investigation Notes
    if (caseData.investigationNotes && caseData.investigationNotes.length > 0) {
      doc.addPage();
      didDrawPage();
      doc.setFontSize(12);
      doc.setTextColor(11, 33, 74);
      doc.text('Investigation Notes', 14, 45);
      
      const notesData = caseData.investigationNotes.map(note => [
        note.note || 'N/A',
        typeof note.author === 'object' ? note.author.name : 'Unknown',
        note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'
      ]);
      
      autoTable(doc, {
        head: [['Note', 'Author', 'Date']],
        body: notesData,
        margin: { top: 50, bottom: 18, left: 14, right: 14 },
        styles: { fontSize: 8, lineColor: brandLight, lineWidth: 0.1 },
        headStyles: { fontSize: 8, fillColor: brandPrimary, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [249, 250, 251] }
      });
    }

    doc.save(`case-${caseData.caseId}-report.pdf`);
  };

  // Export Excel function
  const exportExcel = () => {
    if (!caseData) return;

    try {
      // Prepare data for Excel
      const excelData = [
        ['Case Information', ''],
        ['Case ID', caseData.caseId || 'N/A'],
        ['Status', caseData.status || 'N/A'],
        ['Priority', caseData.priority || 'N/A'],
        ['Urgency Level', caseData.itOfficerDetails?.urgencyLevel || 'N/A'],
        ['Assigned Department', caseData.itOfficerDetails?.assignedDepartment || 'N/A'],
        ['Created Date', caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString() : 'N/A'],
        ['Last Updated', caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString() : 'N/A'],
        ['', ''],
        ['Complainant Information', ''],
        ['Name', caseData.complainant?.name || 'N/A'],
        ['Phone', caseData.complainant?.phone || 'N/A'],
        ['Email', caseData.complainant?.email || 'N/A'],
        ['Address', caseData.complainant?.address || 'N/A'],
        ['', ''],
        ['Complaint Details', ''],
        ['Type of Complaint', caseData.complaintDetails?.typeOfComplaint || 'N/A'],
        ['Incident Date', caseData.complaintDetails?.incidentDate ? new Date(caseData.complaintDetails.incidentDate).toLocaleDateString() : 'N/A'],
        ['Location', caseData.complaintDetails?.location || 'N/A'],
        ['Description', caseData.complaintDetails?.description || 'N/A'],
        ['', ''],
        ['IT Officer Analysis', ''],
        ['Case Analysis', caseData.itOfficerDetails?.caseAnalysis || 'N/A'],
        ['Technical Details', caseData.itOfficerDetails?.technicalDetails || 'N/A'],
        ['Recommended Actions', caseData.itOfficerDetails?.recommendedActions || 'N/A'],
        ['', ''],
        ['Assigned Officer', ''],
        ['Officer Name', caseData.assignedOfficer?.name || 'Not Assigned'],
        ['Officer ID', caseData.assignedOfficer?.officerId || 'N/A'],
        ['Department', caseData.assignedOfficer?.department || 'N/A'],
      ];

      // Add investigation notes if available
      if (caseData.investigationNotes && caseData.investigationNotes.length > 0) {
        excelData.push(['', '']);
        excelData.push(['Investigation Notes', '']);
        excelData.push(['Note', 'Author', 'Date']);
        caseData.investigationNotes.forEach(note => {
          excelData.push([
            note.note || 'N/A',
            typeof note.author === 'object' ? note.author.name : 'Unknown',
            note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'
          ]);
        });
      }

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // First column
        { wch: 50 }, // Second column
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Case Details');

      // Generate and save Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `case-${caseData.caseId}-report.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel file. Please try again.');
    }
  };

  // Export JSON function
  const exportJSON = () => {
    if (!caseData) return;

    try {
      // Create a clean JSON object with all case data
      const jsonData = {
        caseId: caseData.caseId,
        status: caseData.status,
        priority: caseData.priority,
        urgencyLevel: caseData.itOfficerDetails?.urgencyLevel,
        assignedDepartment: caseData.itOfficerDetails?.assignedDepartment,
        createdAt: caseData.createdAt,
        updatedAt: caseData.updatedAt,
        complainant: {
          name: caseData.complainant?.name,
          phone: caseData.complainant?.phone,
          email: caseData.complainant?.email,
          address: caseData.complainant?.address,
        },
        complaintDetails: {
          typeOfComplaint: caseData.complaintDetails?.typeOfComplaint,
          incidentDate: caseData.complaintDetails?.incidentDate,
          location: caseData.complaintDetails?.location,
          description: caseData.complaintDetails?.description,
        },
        itOfficerDetails: {
          caseAnalysis: caseData.itOfficerDetails?.caseAnalysis,
          technicalDetails: caseData.itOfficerDetails?.technicalDetails,
          recommendedActions: caseData.itOfficerDetails?.recommendedActions,
        },
        assignedOfficer: caseData.assignedOfficer ? {
          name: caseData.assignedOfficer.name,
          officerId: caseData.assignedOfficer.officerId,
          department: caseData.assignedOfficer.department,
        } : null,
        investigationNotes: caseData.investigationNotes?.map(note => ({
          note: note.note,
          author: typeof note.author === 'object' ? note.author.name : 'Unknown',
          createdAt: note.createdAt,
        })) || [],
        resourceAllocation: caseData.resourceAllocation || null,
        estimatedLoss: caseData.estimatedLoss,
        exportedAt: new Date().toISOString(),
      };

      // Convert to JSON string with formatting
      const jsonString = JSON.stringify(jsonData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      saveAs(blob, `case-${caseData.caseId}-data.json`);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        {fromAdmin ? <AdminHeader /> : <PoliceHeader />}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading case details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        {fromAdmin ? <AdminHeader /> : <PoliceHeader />}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-8">
            <div className="text-center">
              <p className="text-red-600">Case not found</p>
              <button 
                onClick={() => navigate(fromAdmin ? "/admin/dashboard" : "/it/view-cases")}
                className="mt-4 px-4 py-2 bg-[#0B214A] text-white rounded-lg hover:bg-[#0A1E42]"
              >
                {fromAdmin ? "Back to Admin Dashboard" : "Back to Cases"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      {fromAdmin ? <AdminHeader /> : <PoliceHeader />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-6">
          
          {/* Header */}
          <div className="mb-6 relative">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-800">IT Case Details</h1>
              <p className="text-sm text-slate-600 mt-1">Case ID: {caseData.caseId}</p>
            </div>
            <div className="absolute right-0 top-0 flex gap-2">
              <button 
                onClick={() => navigate(fromAdmin ? "/admin/dashboard" : "/it/view-cases")} 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
              >
                ← {fromAdmin ? "Back to Admin Dashboard" : "Back to Cases"}
              </button>
            </div>
          </div>

          {/* Banner */}
          {banner && (
            <div className={`mb-6 p-4 rounded-lg ${
              banner.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
              banner.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
              'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {banner.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-6 flex gap-2 justify-center flex-wrap">
            {fromAdmin ? (
              // Admin view-only mode - only download options
              <>
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <span>📄</span>
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={exportExcel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Download Excel</span>
                </button>
                
                <div className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
                  <span>👁️</span>
                  <span>Admin View - Read Only</span>
                </div>
              </>
            ) : caseData.status === 'CLOSED' ? (
              // View-only mode for closed cases
              <>
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <span>📄</span>
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={exportExcel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Download Excel</span>
                </button>
                
                <div className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
                  <span>🔒</span>
                  <span>Case Closed - View Only</span>
                </div>
              </>
            ) : !editing ? (
              <>
                <button
                  onClick={exportPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <span>📄</span>
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={exportExcel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Download Excel</span>
                </button>
                
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Case
                </button>
                {caseData.status === 'PENDING_CLOSE' && (
                  <>
                    <button
                      onClick={handleApproveClose}
                      disabled={saving}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {saving ? "Approving..." : "Approve Close Request"}
                    </button>
                    <button
                      onClick={() => setShowDeclineConfirm(true)}
                      disabled={saving}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      Decline Close Request
                    </button>
                  </>
                )}
                {caseData.status !== 'CLOSED' && caseData.status !== 'PENDING_CLOSE' && (
                  <button
                    onClick={() => setShowCloseConfirm(true)}
                    className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Close Case
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Case
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Case Status */}
          <div className="mb-6 text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
              Status: {caseData.status}
            </span>
            {caseData.itOfficerDetails?.urgencyLevel && (
              <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(caseData.itOfficerDetails.urgencyLevel)}`}>
                Urgency: {caseData.itOfficerDetails.urgencyLevel}
              </span>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            
            {/* Complainant Information */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Complainant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
                  <input
                    value={caseData.complainant?.name || ""}
                    onChange={(e) => handleInputChange("complainant.name", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                  <input
                    value={caseData.complainant?.phone || ""}
                    onChange={(e) => handleInputChange("complainant.phone", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                  <input
                    value={caseData.complainant?.email || ""}
                    onChange={(e) => handleInputChange("complainant.email", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                  <input
                    value={caseData.complainant?.address || ""}
                    onChange={(e) => handleInputChange("complainant.address", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  />
                </div>
              </div>
            </section>

            {/* Complaint Details */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Complaint Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Type of Complaint *</label>
                  <select
                    value={caseData.complaintDetails?.typeOfComplaint || ""}
                    onChange={(e) => handleInputChange("complaintDetails.typeOfComplaint", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  >
                    <option value="">Select complaint type</option>
                    {complaintTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={caseData.complaintDetails?.incidentDate ? new Date(caseData.complaintDetails.incidentDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleInputChange("complaintDetails.incidentDate", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Location</label>
                  <input
                    value={caseData.complaintDetails?.location || ""}
                    onChange={(e) => handleInputChange("complaintDetails.location", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                  <textarea
                    value={caseData.complaintDetails?.description || ""}
                    onChange={(e) => handleInputChange("complaintDetails.description", e.target.value)}
                    disabled={!editing || fromAdmin}
                    rows={3}
                    className={`${inputField} h-20 disabled:bg-gray-50`}
                  />
                </div>
              </div>
            </section>

            {/* IT Officer Details */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">IT Officer Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Urgency Level</label>
                  <select
                    value={caseData.itOfficerDetails?.urgencyLevel || "MEDIUM"}
                    onChange={(e) => handleInputChange("itOfficerDetails.urgencyLevel", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  >
                    {urgencyOptions.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Assigned Department</label>
                  <input
                    value={caseData.itOfficerDetails?.assignedDepartment || ""}
                    onChange={(e) => handleInputChange("itOfficerDetails.assignedDepartment", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className={`${inputField} disabled:bg-gray-50`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Case Analysis</label>
                  <textarea
                    value={caseData.itOfficerDetails?.caseAnalysis || ""}
                    onChange={(e) => handleInputChange("itOfficerDetails.caseAnalysis", e.target.value)}
                    disabled={!editing || fromAdmin}
                    rows={3}
                    className={`${inputField} h-20 disabled:bg-gray-50`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Technical Details</label>
                  <textarea
                    value={caseData.itOfficerDetails?.technicalDetails || ""}
                    onChange={(e) => handleInputChange("itOfficerDetails.technicalDetails", e.target.value)}
                    disabled={!editing || fromAdmin}
                    rows={3}
                    className={`${inputField} h-20 disabled:bg-gray-50`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Recommended Actions</label>
                  <textarea
                    value={caseData.itOfficerDetails?.recommendedActions || ""}
                    onChange={(e) => handleInputChange("itOfficerDetails.recommendedActions", e.target.value)}
                    disabled={!editing || fromAdmin}
                    rows={3}
                    className={`${inputField} h-20 disabled:bg-gray-50`}
                  />
                </div>
              </div>
            </section>

            {/* Lead Officer Assignment */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Lead Officer Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Assigned Officer</label>
                  <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-gray-50 text-slate-700">
                    {caseData.assignedOfficer ? (
                      <div>
                        <div className="font-medium">{caseData.assignedOfficer.name || 'Unknown Officer'}</div>
                        <div className="text-xs text-slate-500">
                          ID: {caseData.assignedOfficer.officerId || 'N/A'} | 
                          Department: {caseData.assignedOfficer.department || 'N/A'}
                        </div>
                      </div>
                    ) : (
                      'No officer assigned'
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Assignment Status</label>
                  <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-gray-50 text-slate-700">
                    {caseData.assignedOfficer ? 'Officer Assigned' : 'Pending Assignment'}
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Priority</label>
                  <select
                    value={caseData.priority || "MEDIUM"}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-[#0B214A] disabled:bg-gray-50"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Estimated Loss</label>
                  <input
                    value={caseData.estimatedLoss || ""}
                    onChange={(e) => handleInputChange("estimatedLoss", e.target.value)}
                    disabled={!editing || fromAdmin}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-[#0B214A] disabled:bg-gray-50"
                  />
                </div>
              </div>
            </section>

            {/* Resource Allocation */}
            {caseData.resourceAllocation && (
              <section>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Resource Allocation</h3>
                <div className="space-y-4">
                  {caseData.resourceAllocation.supportOfficers && caseData.resourceAllocation.supportOfficers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-600 mb-2">Support Officers</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseData.resourceAllocation.supportOfficers.map((officer, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {typeof officer === 'object' ? officer.name || officer.officerId : officer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {caseData.resourceAllocation.vehicles && caseData.resourceAllocation.vehicles.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-600 mb-2">Vehicles</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseData.resourceAllocation.vehicles.map((vehicle, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {vehicle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {caseData.resourceAllocation.firearms && caseData.resourceAllocation.firearms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-600 mb-2">Firearms</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseData.resourceAllocation.firearms.map((firearm, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {firearm}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Close Request Information */}
            {caseData.status === 'PENDING_CLOSE' && caseData.closeRequest && (
              <section>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Close Request Information</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-orange-800">Requested by:</span>
                      <p className="text-sm text-orange-700">{caseData.closeRequest.requestedBy?.name || 'Unknown Officer'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-orange-800">Requested on:</span>
                      <p className="text-sm text-orange-700">{new Date(caseData.closeRequest.requestedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-orange-800">Reason:</span>
                      <p className="text-sm text-orange-700">{caseData.closeRequest.reason}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Previous Close Request History */}
            {caseData.closeRequest && (caseData.closeRequest.declinedBy || caseData.closeRequest.approvedBy) && (
              <section>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Close Request History</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {caseData.closeRequest.declinedBy && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-red-800">Declined by:</span>
                          <p className="text-sm text-red-700">{caseData.closeRequest.declinedBy?.name || 'Unknown Officer'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-red-800">Declined on:</span>
                          <p className="text-sm text-red-700">{new Date(caseData.closeRequest.declinedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-red-800">Decline reason:</span>
                          <p className="text-sm text-red-700">{caseData.closeRequest.declineReason}</p>
                        </div>
                      </>
                    )}
                    {caseData.closeRequest.approvedBy && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-green-800">Approved by:</span>
                          <p className="text-sm text-green-700">{caseData.closeRequest.approvedBy?.name || 'Unknown Officer'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-800">Approved on:</span>
                          <p className="text-sm text-green-700">{new Date(caseData.closeRequest.approvedAt).toLocaleString()}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Investigation Notes */}
            {caseData.investigationNotes && caseData.investigationNotes.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Investigation Notes</h3>
                <div className="space-y-3">
                  {caseData.investigationNotes.map((note, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {typeof note.author === 'object' ? note.author.name : 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.note}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this case? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Case Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Close Case</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to close this case? You can add closing notes below.
            </p>
            <textarea
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Add closing notes (optional)..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-[#0B214A] mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  setCloseNotes("");
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCase}
                disabled={saving}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? "Closing..." : "Close Case"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Close Request Confirmation Modal */}
      {showDeclineConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Decline Close Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for declining this close request. The case will be returned to the assigned officer.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining the close request..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-[#0B214A] mb-6"
              required
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeclineConfirm(false);
                  setDeclineReason("");
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineClose}
                disabled={saving || !declineReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Declining..." : "Decline Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
