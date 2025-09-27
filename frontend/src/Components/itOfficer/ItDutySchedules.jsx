import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import {
  User,
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  Trash2,
  ArrowLeft,
  ClipboardList,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Search,
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ItDutySchedules = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    officer: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [reassignForm, setReassignForm] = useState({
    officer: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [showReassignForm, setShowReassignForm] = useState(null);
  const [reassignReason, setReassignReason] = useState('');
  const [exportFilters, setExportFilters] = useState({
    officer: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [o, s] = await Promise.all([
          axiosInstance.get("/officers", {
            params: {
              page: 1,
              pageSize: 100,
              role: "All",
              status: "All",
              station: "All",
            },
          }),
          axiosInstance.get("/schedules", {
            params: { page: 1, pageSize: 200 },
          }),
        ]);
        const list = Array.isArray(o.data?.data) ? o.data.data : [];
        setOfficers(list.filter((x) => x.role === "Officer"));
        setItems(s.data?.data || []);
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.officer || !form.date || !form.startTime || !form.endTime) return;
    const payload = {
      officer: form.officer,
      date: form.date,
      shift: `${form.startTime}-${form.endTime}`,
      location: form.location,
      notes: form.notes,
    };
    await axiosInstance.post("/schedules", payload);
    const res = await axiosInstance.get("/schedules", {
      params: { page: 1, pageSize: 200 },
    });
    setItems(res.data?.data || []);
    setForm({
      officer: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
    });
  };

  const remove = async (id) => {
    await axiosInstance.delete(`/schedules/${id}`);
    setItems((prev) => prev.filter((x) => x._id !== id));
  };

  const reassign = async (id) => {
    if (!reassignForm.officer || !reassignForm.date || !reassignForm.startTime || !reassignForm.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    const payload = {
      officer: reassignForm.officer,
      date: reassignForm.date,
      shift: `${reassignForm.startTime}-${reassignForm.endTime}`,
      location: reassignForm.location,
      notes: reassignForm.notes,
    };
    
    await axiosInstance.put(`/schedules/${id}/reassign`, payload);
    
    // Refresh the schedules list
    const res = await axiosInstance.get("/schedules", {
      params: { page: 1, pageSize: 200 },
    });
    setItems(res.data?.data || []);
    
    // Reset form and close
    setReassignForm({
      officer: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
    });
    setShowReassignForm(null);
    setReassignReason('');
  };

  const openReassignForm = (schedule) => {
    // Pre-fill the form with current schedule data
    const startTime = schedule.shift ? schedule.shift.split('-')[0] : '';
    const endTime = schedule.shift ? schedule.shift.split('-')[1] : '';
    
    setReassignForm({
      officer: schedule.officer?._id || schedule.officer || "",
      date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : "",
      startTime: startTime,
      endTime: endTime,
      location: schedule.location || "",
      notes: schedule.notes || "",
    });
    setShowReassignForm(schedule._id);
    setReassignReason('');
  };

  const officerMap = useMemo(
    () => Object.fromEntries(officers.map((o) => [o._id, o])),
    [officers]
  );

  // Filter schedules based on search term
  const getFilteredSchedules = () => {
    if (!searchTerm.trim()) {
      return items;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => {
      const officerName = officerMap[item.officer?._id || item.officer]?.name || '';
      const location = item.location || '';
      
      return officerName.toLowerCase().includes(searchLower) || 
             location.toLowerCase().includes(searchLower);
    });
  };

  // Filter data based on export filters
  const getFilteredData = () => {
    return items.filter(item => {
      const officerMatch = !exportFilters.officer || item.officer?._id === exportFilters.officer || item.officer === exportFilters.officer;
      const statusMatch = !exportFilters.status || item.remark === exportFilters.status;
      const startDateMatch = !exportFilters.startDate || new Date(item.date) >= new Date(exportFilters.startDate);
      const endDateMatch = !exportFilters.endDate || new Date(item.date) <= new Date(exportFilters.endDate);
      
      return officerMatch && statusMatch && startDateMatch && endDateMatch;
    });
  };

  // Generate PDF Report
  const generatePDF = () => {
    try {
      const filteredData = getFilteredData();
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Duty Schedule Report', 14, 22);
      
      // Report info
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Records: ${filteredData.length}`, 14, 35);
      
      // Filters applied
      if (exportFilters.officer || exportFilters.status || exportFilters.startDate || exportFilters.endDate) {
        doc.text('Filters Applied:', 14, 45);
        let yPos = 50;
        
        if (exportFilters.officer) {
          const officerName = officerMap[exportFilters.officer]?.name || 'Unknown';
          doc.text(`Officer: ${officerName}`, 20, yPos);
          yPos += 5;
        }
        if (exportFilters.status) {
          doc.text(`Status: ${exportFilters.status}`, 20, yPos);
          yPos += 5;
        }
        if (exportFilters.startDate) {
          doc.text(`From: ${exportFilters.startDate}`, 20, yPos);
          yPos += 5;
        }
        if (exportFilters.endDate) {
          doc.text(`To: ${exportFilters.endDate}`, 20, yPos);
          yPos += 5;
        }
      }
      
      // Table data
      const tableData = filteredData.map(item => [
        officerMap[item.officer?._id || item.officer]?.name || 'Unknown',
        item.date ? new Date(item.date).toLocaleDateString() : '',
        item.shift || '',
        item.location || '',
        item.notes || '',
        item.remark || 'pending',
        item.declineReason || ''
      ]);
      
      // Table
      autoTable(doc, {
        head: [['Officer', 'Date', 'Shift', 'Location', 'Notes', 'Status', 'Decline Reason']],
        body: tableData,
        startY: exportFilters.officer || exportFilters.status || exportFilters.startDate || exportFilters.endDate ? 70 : 50,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      // Save the PDF
      doc.save(`duty-schedule-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Generate Excel Report
  const generateExcel = () => {
    try {
      const filteredData = getFilteredData();
      
      // Prepare data for Excel
      const excelData = filteredData.map(item => ({
        'Officer': officerMap[item.officer?._id || item.officer]?.name || 'Unknown',
        'Date': item.date ? new Date(item.date).toLocaleDateString() : '',
        'Shift': item.shift || '',
        'Location': item.location || '',
        'Notes': item.notes || '',
        'Status': item.remark || 'pending',
        'Decline Reason': item.declineReason || ''
      }));
      
      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Duty Schedules');
      
      // Add metadata sheet
      const metadata = [
        { 'Report': 'Duty Schedule Report' },
        { 'Generated On': new Date().toLocaleDateString() },
        { 'Total Records': filteredData.length },
        { 'Officer Filter': exportFilters.officer ? officerMap[exportFilters.officer]?.name : 'All' },
        { 'Status Filter': exportFilters.status || 'All' },
        { 'Date Range': `${exportFilters.startDate || 'Any'} to ${exportFilters.endDate || 'Any'}` }
      ];
      
      const metadataWs = XLSX.utils.json_to_sheet(metadata);
      XLSX.utils.book_append_sheet(wb, metadataWs, 'Report Info');
      
      // Generate and save Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `duty-schedule-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FB] via-[#E9EEF5] to-[#F4F7FB] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Duty Schedules</h1>
            <p className="text-sm text-[#5A6B85]">
              Assign shifts and manage upcoming officer schedules
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" /> Export Reports
            </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white hover:bg-[#123974] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        </div>

        {/* Export Dropdown Section */}
        {showExportDropdown && (
          <div className="mb-6 p-6 rounded-2xl bg-white shadow-md border border-[#E5E9F2]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Export Reports
              </h3>
              <button
                onClick={() => setShowExportDropdown(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Officer
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={exportFilters.officer}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, officer: e.target.value }))}
                >
                  <option value="">All Officers</option>
                  {officers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={exportFilters.status}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={exportFilters.startDate}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={exportFilters.endDate}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExportDropdown(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generatePDF();
                  setShowExportDropdown(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => {
                  generateExcel();
                  setShowExportDropdown(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={save}
          className="p-6 rounded-2xl bg-white shadow-md border border-[#E5E9F2] mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0B214A]" />
            Create New Duty Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.officer}
              onChange={(e) =>
                setForm((v) => ({ ...v, officer: e.target.value }))
              }
              required
            >
              <option value="">Select Officer</option>
              {officers.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))}
              required
            />
            <input
              type="time"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.startTime}
              onChange={(e) =>
                setForm((v) => ({ ...v, startTime: e.target.value }))
              }
              required
            />
            <input
              type="time"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.endTime}
              onChange={(e) =>
                setForm((v) => ({ ...v, endTime: e.target.value }))
              }
              required
            />
            <input
              type="text"
              placeholder="Location"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.location}
              onChange={(e) =>
                setForm((v) => ({ ...v, location: e.target.value }))
              }
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#0B214A] text-white hover:bg-[#123974] transition text-sm"
            >
              Save
            </button>
            <textarea
              placeholder="Notes (optional)"
              className="md:col-span-6 border border-[#E5E9F2] rounded-md px-3 py-2 text-sm mt-2"
              value={form.notes}
              onChange={(e) =>
                setForm((v) => ({ ...v, notes: e.target.value }))
              }
            />
          </div>
        </form>

        {/* Table */}
        <div className="p-6 rounded-2xl bg-white shadow-md border border-[#E5E9F2]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#0B214A]" />
            Upcoming Schedules
          </h2>
          
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by officer name or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="mt-2 text-xs text-gray-600">
                Showing {getFilteredSchedules().length} of {items.length} schedules
              </div>
            )}
          </div>
          {loading ? (
            <p className="text-sm text-[#5A6B85] animate-pulse">
              Loading schedules…
            </p>
          ) : getFilteredSchedules().length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 mx-auto text-[#9AA7C2]" />
              <p className="mt-3 text-sm text-[#5A6B85]">
                {searchTerm ? 'No schedules found matching your search.' : 'No schedules have been assigned yet.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredSchedules().map((it) => (
                <div
                      key={it._id}
                  className="px-5 py-4 rounded-xl border border-[#E5E9F2] bg-gradient-to-r from-[#F9FBFF] to-[#F2F6FB] hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    {/* Schedule Details */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                        <User className="w-4 h-4 text-[#1D4ED8]" />
                        {officerMap[it.officer?._id || it.officer]?.name ||
                          it.officer?.name ||
                          "—"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#374151]">
                        <CalendarDays className="w-4 h-4 text-[#059669]" />
                        {it.date
                          ? new Date(it.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#374151]">
                        <Clock className="w-4 h-4 text-[#059669]" />
                        {it.shift}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#374151]">
                        <MapPin className="w-4 h-4 text-[#DC2626]" />
                        {it.location || "Location not specified"}
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="mt-2 md:mt-0 flex items-center gap-4">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        it.remark === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : it.remark === 'accepted' 
                          ? 'bg-blue-100 text-blue-800' 
                          : it.remark === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : it.remark === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {it.remark || 'pending'}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {it.remark === 'declined' && (
                          <button
                            onClick={() => openReassignForm(it)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Re-assign
                          </button>
                        )}
                        <button
                          onClick={() => remove(it._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {it.notes && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-[#4B5563]">
                      <ClipboardList className="w-4 h-4 text-[#F59E0B]" />
                      <span>{it.notes}</span>
                    </div>
                  )}

                  {/* Decline Reason Display */}
                  {it.remark === 'declined' && it.declineReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-sm font-medium text-red-800 mb-1">Decline Reason:</div>
                      <div className="text-sm text-red-700">{it.declineReason}</div>
                    </div>
                  )}

                  {/* Re-assign Form */}
                  {showReassignForm === it._id && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm font-medium text-blue-800 mb-3">Re-assign Schedule:</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Officer *
                          </label>
                          <select
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.officer}
                            onChange={(e) => setReassignForm((v) => ({ ...v, officer: e.target.value }))}
                            required
                          >
                            <option value="">Select Officer</option>
                            {officers.map((o) => (
                              <option key={o._id} value={o._id}>
                                {o.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Date *
                          </label>
                          <input
                            type="date"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.date}
                            onChange={(e) => setReassignForm((v) => ({ ...v, date: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.startTime}
                            onChange={(e) => setReassignForm((v) => ({ ...v, startTime: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            End Time *
                          </label>
                          <input
                            type="time"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.endTime}
                            onChange={(e) => setReassignForm((v) => ({ ...v, endTime: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            placeholder="Location"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.location}
                            onChange={(e) => setReassignForm((v) => ({ ...v, location: e.target.value }))}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            placeholder="Notes (optional)"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.notes}
                            onChange={(e) => setReassignForm((v) => ({ ...v, notes: e.target.value }))}
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => reassign(it._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                        >
                          Submit Re-assignment
                        </button>
                        <button
                          onClick={() => {
                            setShowReassignForm(null);
                            setReassignReason('');
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItDutySchedules;
