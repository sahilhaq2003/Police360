import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000/api/accidents';

// ---- helpers ----
//const toDate = (d) => (d ? new Date(d) : null);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : '—');

const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

const monthKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const titleMap = {
  type: 'Accident Type',
  status: 'Status',
  officer: 'Assigned Officer',
  month: 'Reported Month',
  emergency: 'Emergency',
};

// ---- main ----
export default function AccidentReports() {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Report criteria
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [emergency, setEmergency] = useState(''); // '', 'true', 'false'
  const [officer, setOfficer] = useState('');
  const [groupByKey, setGroupByKey] = useState('type'); // type | status | officer | month | emergency
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  // Load all (you can switch to server-side filters using query params if preferred)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL, { params: { limit: 5000 } });
        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : [res.data].filter(Boolean);
        setAccidents(items);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtered dataset
  const filtered = useMemo(() => {
    let data = accidents.slice();

    if (dateFrom) {
      const f = new Date(dateFrom);
      data = data.filter((a) => new Date(a.createdAt) >= f);
    }
    if (dateTo) {
      const t = new Date(dateTo);
      // include end-of-day
      t.setHours(23, 59, 59, 999);
      data = data.filter((a) => new Date(a.createdAt) <= t);
    }
    if (type) data = data.filter((a) => a.accidentType === type);
    if (status) data = data.filter((a) => a.status === status);
    if (emergency) {
      const flag = emergency === 'true';
      data = data.filter((a) => !!a.isEmergency === flag);
    }
    if (officer) {
      data = data.filter(
        (a) =>
          a.assignedOfficer &&
          (a.assignedOfficer._id === officer ||
            a.assignedOfficer.officerId === officer ||
            a.assignedOfficer.name === officer)
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((a) => {
        const parts = [
          a.trackingId,
          a.accidentType,
          a.locationText,
          a.nic,
          a.assignedOfficer?.name,
          a.assignedOfficer?.officerId,
        ]
          .filter(Boolean)
          .map((x) => String(x).toLowerCase());
        return parts.some((p) => p.includes(q));
      });
    }
    return data;
  }, [accidents, dateFrom, dateTo, type, status, emergency, officer, search]);

  // Distincts for selects
  const officerOptions = useMemo(() => {
    const map = new Map();
    accidents.forEach((a) => {
      const o = a.assignedOfficer;
      if (!o) return;
      map.set(o._id || o.officerId || o.name, o);
    });
    return Array.from(map.values());
  }, [accidents]);

  // Summary KPIs for decision-making
  const kpis = useMemo(() => {
    const total = filtered.length;
    const emergencies = filtered.filter((a) => a.isEmergency).length;
    const pctEmergency = total ? Math.round((emergencies / total) * 100) : 0;

    const byStatus = groupBy(filtered, (a) => a.status || 'UNKNOWN');
    const byType = groupBy(filtered, (a) => a.accidentType || 'OTHER');
    const byMonth = groupBy(filtered, (a) => monthKey(a.createdAt));

    // avg per day in range (or dataset span)
    let days = 0;
    if (filtered.length > 0) {
      const min = Math.min(...filtered.map((a) => +new Date(a.createdAt)));
      const max = Math.max(...filtered.map((a) => +new Date(a.createdAt)));
      const diff = Math.max(1, Math.ceil((max - min) / (1000 * 60 * 60 * 24)));
      days = diff;
    }
    const avgPerDay = days ? (total / days).toFixed(2) : '0.00';

    // top locations (rough)
    const byLocation = groupBy(filtered, (a) => a.locationText || '—');
    const topLocations = Object.entries(byLocation)
      .map(([k, arr]) => ({ k, n: arr.length }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);

    return {
      total,
      emergencies,
      pctEmergency,
      byStatus,
      byType,
      byMonth,
      avgPerDay,
      topLocations,
    };
  }, [filtered]);

  // Grouped view
  const grouped = useMemo(() => {
    switch (groupByKey) {
      case 'status':
        return groupBy(filtered, (a) => a.status || 'UNKNOWN');
      case 'officer':
        return groupBy(
          filtered,
          (a) =>
            a.assignedOfficer?.name ||
            a.assignedOfficer?.officerId ||
            'Unassigned'
        );
      case 'month':
        return groupBy(filtered, (a) => monthKey(a.createdAt));
      case 'emergency':
        return groupBy(filtered, (a) =>
          a.isEmergency ? 'Emergency' : 'Normal'
        );
      case 'type':
      default:
        return groupBy(
          filtered,
          (a) => a.accidentType?.replaceAll('_', ' ') || 'OTHER'
        );
    }
  }, [filtered, groupByKey]);

  // -------- Export PDF (grouped sections + KPIs) --------
  const exportPDF = () => {
    if (!filtered.length) {
      alert('No data for the selected criteria.');
      return;
    }

    const doc = new jsPDF('p', 'pt', 'a4');
    const marginX = 40;
    let y = 40;

    // Title
    doc.setFontSize(18);
    doc.text('Police360 — Accident Report', marginX, y);
    y += 24;
    doc.setFontSize(11);
    doc.text(
      `Generated: ${fmtDateTime(new Date())} • Records: ${filtered.length}`,
      marginX,
      y
    );
    y += 16;

    // Criteria summary
    const critLines = [
      dateFrom ? `From: ${fmtDate(dateFrom)}` : null,
      dateTo ? `To: ${fmtDate(dateTo)}` : null,
      type ? `Type: ${type.replaceAll('_', ' ')}` : null,
      status ? `Status: ${status.replaceAll('_', ' ')}` : null,
      emergency ? `Emergency: ${emergency === 'true' ? 'Yes' : 'No'}` : null,
      officer ? `Officer: ${officer}` : null,
      search ? `Search: "${search}"` : null,
    ]
      .filter(Boolean)
      .join('  |  ');
    if (critLines) {
      doc.setFontSize(10);
      doc.text(critLines, marginX, y);
      y += 14;
    }

    // KPI block
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [['Metric', 'Value']],
      body: [
        ['Total Accidents', kpis.total],
        ['Emergency Cases', `${kpis.emergencies} (${kpis.pctEmergency}%)`],
        ['Average per Day (period)', kpis.avgPerDay],
        [
          'Top Locations',
          kpis.topLocations.length
            ? kpis.topLocations.map((t) => `${t.k} (${t.n})`).join(', ')
            : '—',
        ],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [11, 33, 74] },
      margin: { left: marginX, right: marginX },
    });
    y = doc.lastAutoTable.finalY + 20;

    // Grouped sections
    doc.setFontSize(12);
    doc.text(`Grouped by ${titleMap[groupByKey]}`, marginX, y);
    y += 10;

    const entries = Object.entries(grouped).sort(
      (a, b) => b[1].length - a[1].length
    );

    entries.forEach(([group, rows], idx) => {
      autoTable(doc, {
        startY: idx === 0 ? y : doc.lastAutoTable.finalY + 16,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [11, 33, 74] },
        margin: { left: marginX, right: marginX },
        head: [
          [
            `${group} — ${rows.length} record(s)`,
            'Tracking ID',
            'Type',
            'Emergency',
            'Status',
            'Officer',
            'Date',
            'Location',
          ],
        ],
        body: rows.map((a) => [
          '', // empty first col to keep group header bold
          a.trackingId || '—',
          a.accidentType?.replaceAll('_', ' ') || '—',
          a.isEmergency ? 'Emergency' : 'Normal',
          a.status?.replaceAll('_', ' ') || '—',
          a.assignedOfficer?.name || a.assignedOfficer?.officerId || '—',
          fmtDate(a.createdAt),
          a.locationText || '—',
        ]),
        columnStyles: {
          0: { cellWidth: 0 }, // hide first column content, used only for bold group title
          7: { cellWidth: 160 },
        },
        didParseCell: (data) => {
          // make the head row (with group label) bold
          if (data.section === 'head' && data.row.index === 0) {
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });
    });

    doc.save('police360-accident-report.pdf');
  };

  // -------- Export Excel (flat, still respects filters) --------
  const exportExcel = () => {
    if (!filtered.length) {
      alert('No data for the selected criteria.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((a) => ({
        'Tracking ID': a.trackingId,
        Type: a.accidentType?.replaceAll('_', ' '),
        Emergency: a.isEmergency ? 'Yes' : 'No',
        Status: a.status?.replaceAll('_', ' '),
        Officer: a.assignedOfficer?.name || a.assignedOfficer?.officerId || '',
        Date: fmtDate(a.createdAt),
        Location: a.locationText,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Accidents');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'police360-accident-report.xlsx');
  };

  // ---- UI ----
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PoliceHeader />
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-40 w-full bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PoliceHeader />
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {err}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-screen-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Dynamic Reports
          </h1>
          <p className="text-sm text-[#5A6B85] mt-1">
            Filter, group, and export decision-ready reports.
          </p>
          <div className="text-right">
            <button
              onClick={() => navigate('/accidents')}
              className="px-4 py-2 bg-[#0B214A] text-white rounded-lg hover:opacity-80 transition"
            >
              Back to Accident Records
            </button>
          </div>
        </div>

        {/* Criteria */}
        <div className="bg-white/80 border border-[#E4E9F2] rounded-xl shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-500">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                <option value="">All</option>
                <option value="ROAD_ACCIDENT">Road Accident</option>
                <option value="FIRE">Fire</option>
                <option value="STRUCTURAL_COLLAPSE">Structural Collapse</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                <option value="">All</option>
                <option value="REPORTED">Reported</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Emergency</label>
              <select
                value={emergency}
                onChange={(e) => setEmergency(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                <option value="">All</option>
                <option value="true">Emergency</option>
                <option value="false">Normal</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Assigned Officer</label>
              <select
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                <option value="">All</option>
                {officerOptions.map((o) => (
                  <option
                    key={o._id || o.officerId || o.name}
                    value={o._id || o.officerId || o.name}
                  >
                    {o.name || o.officerId || o.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Group By</label>
              <select
                value={groupByKey}
                onChange={(e) => setGroupByKey(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              >
                <option value="type">Accident Type</option>
                <option value="status">Status</option>
                <option value="officer">Assigned Officer</option>
                <option value="month">Reported Month</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Search</label>
              <input
                type="text"
                placeholder="tracking id / location / nic"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 justify-end">
            <button
              onClick={exportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white text-sm font-medium shadow hover:opacity-90"
            >
              📄 Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium shadow hover:opacity-90"
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl bg-white border border-[#E4E9F2] p-4">
            <div className="text-xs text-slate-500">Total Accidents</div>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </div>
          <div className="rounded-xl bg-white border border-[#E4E9F2] p-4">
            <div className="text-xs text-slate-500">Emergency Cases</div>
            <div className="text-2xl font-bold">
              {kpis.emergencies}{' '}
              <span className="text-sm text-slate-500">
                ({kpis.pctEmergency}%)
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-[#E4E9F2] p-4">
            <div className="text-xs text-slate-500">Average per Day</div>
            <div className="text-2xl font-bold">{kpis.avgPerDay}</div>
          </div>
          <div className="rounded-xl bg-white border border-[#E4E9F2] p-4">
            <div className="text-xs text-slate-500">Top Location</div>
            <div className="text-sm font-semibold">
              {kpis.topLocations[0]
                ? `${kpis.topLocations[0].k} (${kpis.topLocations[0].n})`
                : '—'}
            </div>
          </div>
        </div>

        {/* Grouped preview table (useful on screen) */}
        <div className="mt-6 space-y-6">
          {Object.entries(grouped)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([g, rows]) => (
              <div
                key={g}
                className="rounded-xl bg-white border border-[#E4E9F2] overflow-hidden"
              >
                <div className="bg-[#0B214A] text-white px-4 py-2 text-sm font-semibold flex items-center justify-between">
                  <span>
                    {titleMap[groupByKey]}: {g}
                  </span>
                  <span>{rows.length} record(s)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="px-4 py-2 text-left">Tracking ID</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Emergency</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Officer</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((a) => (
                        <tr key={a._id}>
                          <td className="px-4 py-2">{a.trackingId}</td>
                          <td className="px-4 py-2">
                            {a.accidentType?.replaceAll('_', ' ')}
                          </td>
                          <td className="px-4 py-2">
                            {a.isEmergency ? 'Emergency' : 'Normal'}
                          </td>
                          <td className="px-4 py-2">
                            {a.status?.replaceAll('_', ' ')}
                          </td>
                          <td className="px-4 py-2">
                            {a.assignedOfficer?.name ||
                              a.assignedOfficer?.officerId ||
                              '—'}
                          </td>
                          <td className="px-4 py-2">{fmtDate(a.createdAt)}</td>
                          <td className="px-4 py-2 max-w-[420px] truncate">
                            {a.locationText}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
