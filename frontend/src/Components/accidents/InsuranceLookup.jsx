import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeft } from 'lucide-react';

function StatusPill({ status }) {
  const map = {
    REPORTED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    UNDER_INVESTIGATION: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    CLOSED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        map[status] || 'bg-[#0B214A] text-white'
      }`}
    >
      {status ? status.replaceAll('_', ' ') : 'Unknown'}
    </span>
  );
}

export default function InsuranceLookup() {
  const [company, setCompany] = useState('');
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [accident, setAccident] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAccident(null);

    if (!company.trim() || !ref.trim()) {
      setError('Please enter both Insurance Company and Reference Number.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/accidents/insurance', {
        params: { company: company.trim(), ref: ref.trim() },
      });
      setAccident(data);
    } catch (e2) {
      setError(
        e2?.response?.data?.message ||
          e2?.message ||
          'No accident found for the provided details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!accident) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Accident Report', 14, 15);

    autoTable(doc, {
      head: [['Field', 'Value']],
      body: [
        ['Tracking ID', accident.trackingId || '—'],
        ['Type', accident.accidentType?.replaceAll('_', ' ') || '—'],
        ['Status', accident.status || '—'],
        ['Location', accident.locationText || '—'],
        [
          'Reported At',
          accident.createdAt
            ? new Date(accident.createdAt).toLocaleString()
            : '—',
        ],
        [
          'Last Updated',
          accident.updatedAt
            ? new Date(accident.updatedAt).toLocaleString()
            : '—',
        ],
        ['Victim Name', accident.victim?.fullName || '—'],
        ['Victim Phone', accident.victim?.phone || '—'],
        ['Victim Email', accident.victim?.email || '—'],
        ['Victim Address', accident.victim?.address || '—'],
        ['Insurance Company', accident.victim?.insuranceCompany || '—'],
        ['Policy No.', accident.victim?.insurancePolicyNo || '—'],
        ['Insurance Ref', accident.victim?.insuranceRefNo || '—'],
        ['Vehicle Plate', accident.vehicle?.plateNo || '—'],
        ['Vehicle Make', accident.vehicle?.make || '—'],
        ['Vehicle Model', accident.vehicle?.model || '—'],
        ['Vehicle Color', accident.vehicle?.color || '—'],
        ['Owner NIC', accident.vehicle?.ownerNIC || '—'],
      ],
      startY: 25,
    });

    if (
      Array.isArray(accident.investigationNotes) &&
      accident.investigationNotes.length > 0
    ) {
      doc.addPage();
      doc.text('Investigation Notes', 14, 15);
      autoTable(doc, {
        head: [['Note', 'Added By', 'Date']],
        body: accident.investigationNotes.map((n) => [
          n.note,
          n.addedBy || '—',
          n.createdAt ? new Date(n.createdAt).toLocaleString() : '—',
        ]),
        startY: 25,
      });
    }

    doc.save(`accident-${accident.trackingId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white text-sm font-medium shadow hover:opacity-90 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Search Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[#0B214A]">
            Insurance Lookup
          </h1>
          <p className="text-sm text-[#0B214A]/70">
            Enter the insurance company and reference number to view the
            accident.
          </p>

          <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Insurance Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="rounded-xl border border-[#0B214A]/30 h-10 px-3 sm:col-span-1 text-[#0B214A]"
            />
            <input
              type="text"
              placeholder="Reference Number"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className="rounded-xl border border-[#0B214A]/30 h-10 px-3 sm:col-span-1 text-[#0B214A]"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#0B214A] text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 sm:col-span-1"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        {accident && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            {/* ...existing accident details UI... */}

            {/* PDF Download */}
            <div className="pt-4">
              <button
                onClick={exportPDF}
                className="rounded-lg bg-[#0B214A] text-white px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
