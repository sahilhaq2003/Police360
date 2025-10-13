import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

// for export
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const URL = 'http://localhost:8000/api/accidents';

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => {
    if (res.data.items && Array.isArray(res.data.items)) return res.data.items;
    if (Array.isArray(res.data)) return res.data;
    return [res.data];
  });
};

function AllAccidents() {
  const [accidents, setAccidents] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler().then((data) => setAccidents(data));
    (async () => {
      try {
        const res = await axiosInstance.get('/officers', {
          params: { page: 1, pageSize: 100 },
        });
        const list = res.data?.data?.docs || res.data?.data || res.data || [];
        setOfficers(Array.isArray(list) ? list : []);
      } catch (e) {
        alert(
          e?.response?.data?.message || e.message || 'Failed to load officers'
        );
      }
    })();
  }, []);

  // filter accidents by selected month
  const filteredAccidents = accidents.filter((a) => {
    if (!selectedMonth) return true;
    const date = new Date(a.createdAt);
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
    return monthYear === selectedMonth;
  });

  // Export PDF
  const exportPDF = () => {
    if (!filteredAccidents || filteredAccidents.length === 0) {
      alert('No accidents available to export.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Accident Report', 14, 15);

    const tableColumn = [
      'Tracking ID',
      'Type',
      'Emergency',
      'Location',
      'Officer',
      'Date',
    ];
    const tableRows = filteredAccidents.map((a) => [
      a.trackingId || '—',
      a.accidentType || '—',
      a.isEmergency ? 'Emergency' : 'Normal',
      a.locationText || '—',
      a.assignedOfficer?.name || '—',
      new Date(a.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save('accidents-report.pdf');
  };

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredAccidents.map((a) => ({
        'Tracking ID': a.trackingId,
        Type: a.accidentType,
        Emergency: a.isEmergency ? 'Yes' : 'No',
        Location: a.locationText,
        'Assigned Officer': a.assignedOfficer?.name || '—',
        Date: new Date(a.createdAt).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Accidents');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'accidents-report.xlsx');
  };

  const startAssign = (accident) => {
    setAssigningId(accident._id);
    setSelectedOfficerId('');
  };

  const cancelAssign = () => {
    setAssigningId(null);
    setSelectedOfficerId('');
  };

  const confirmAssign = async (accident) => {
    if (!selectedOfficerId) return alert('Please select an officer');

    try {
      const res = await axiosInstance.post(
        `/accidents/${accident._id}/assign`,
        {
          officerId: selectedOfficerId,
        }
      );

      const updated = res.data;
      setAccidents((prev) =>
        prev.map((a) => (a._id === accident._id ? updated : a))
      );
      setAssigningId(null);
      setSelectedOfficerId('');
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to assign');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Accident Records
          </h1>
          <p className="text-sm text-[#5A6B85] mt-1">
            Browse, assign and manage reported accidents
          </p>
        </div>

        {/* Back + Filter + Export bar */}
        <div className="flex justify-between items-center mb-8 gap-3 bg-white/70 backdrop-blur-sm shadow-md border border-[#E4E9F2] rounded-xl p-4">
          {/* Back button at start */}
          <button
            onClick={() => navigate('/itOfficer/itOfficerDashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white text-sm font-medium shadow hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          {/* Filter + Export buttons to right */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium text-[#0B214A]">
              Filter by Month:
            </label>
            <select
              className="px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] bg-white focus:ring-2 focus:ring-[#0B214A] focus:outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              <option value="2025-09">September 2025</option>
              <option value="2025-08">August 2025</option>
              <option value="2025-07">July 2025</option>
            </select>

            <button
              onClick={exportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium shadow hover:opacity-90 transition"
            >
              📄 Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium shadow hover:opacity-90 transition"
            >
              📊 Export Excel
            </button>
            <button
              onClick={() => navigate('/Accidents/reports')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#0B214A] text-white text-sm font-medium bg-[#0B214A] hover:opacity-90 transition"
              title="Open the dynamic report builder"
            >
              <FileText className="w-4 h-4" />
              Reports
            </button>
          </div>
        </div>

        {filteredAccidents.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">
            No accidents found.
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-[#E4E9F2] rounded-2xl shadow-lg overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#0B214A] text-white text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Tracking ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Emergency</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Reported Date</th>

                  <th className="px-5 py-3">Assigned Officer</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {filteredAccidents.map((accident, idx) => (
                  <tr
                    key={accident._id}
                    className={`hover:bg-[#F9FAFB] transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                    }`}
                  >
                    <td className="px-5 py-3 max-w-[160px] truncate">
                      {accident._id}
                    </td>
                    <td className="px-5 py-3">{accident.trackingId}</td>
                    <td className="px-5 py-3 font-medium text-[#0B214A]">
                      {accident.accidentType?.replaceAll('_', ' ')}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${
                          accident.isEmergency
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}
                      >
                        {accident.isEmergency ? 'Emergency' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-5 py-3 truncate max-w-[220px]">
                      {accident.locationText}
                    </td>
                    <td className="px-5 py-3">
                      {new Date(accident.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3">
                      {accident.assignedOfficer
                        ? accident.assignedOfficer.name ||
                          accident.assignedOfficer.officerId ||
                          String(accident.assignedOfficer)
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        {assigningId === accident._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="px-2 py-1 rounded-lg border border-[#D6DEEB] bg-white text-xs"
                              value={selectedOfficerId}
                              onChange={(e) =>
                                setSelectedOfficerId(e.target.value)
                              }
                            >
                              <option value="">Select officer…</option>
                              {officers
                                .filter((o) => o.role === 'Officer')
                                .map((o) => (
                                  <option key={o._id} value={o._id}>
                                    {o.name || o.officerId || o.email}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => confirmAssign(accident)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0B214A] text-white text-xs hover:opacity-95"
                            >
                              <UserCheck className="w-4 h-4" /> Save
                            </button>
                            <button
                              onClick={cancelAssign}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs hover:bg-[#F5F7FB]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startAssign(accident)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0B214A] text-white text-xs hover:opacity-95"
                          >
                            <UserCheck className="w-4 h-4" /> Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllAccidents;
