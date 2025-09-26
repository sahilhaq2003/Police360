import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatusPill({ status }) {
  const map = {
    REPORTED: 'bg-amber-50 text-amber-700',
    UNDER_INVESTIGATION: 'bg-indigo-50 text-indigo-700',
    CLOSED: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
        map[status] || 'bg-slate-50 text-slate-700'
      }`}
    >
      {status ? status.replaceAll('_', ' ') : 'Unknown'}
    </span>
  );
}

export default function TrackAccident() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [accident, setAccident] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAccident(null);

    const id = (trackingId || '').trim();
    if (!id) {
      setError('Please enter a tracking ID.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/accidents/by-tracking/${id}`);
      setAccident(data);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'No accident found for that tracking ID.';
      setError(msg);
      console.warn('Track error:', e?.response || e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white text-sm font-medium shadow hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Track Accident
          </h1>
          <p className="text-sm text-[#5A6B85] mt-1">
            Enter the tracking ID to view status and investigation notes
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="e.g. ACC-XXXXXXXX"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1 h-11 rounded-xl border border-[#D6DEEB] bg-white px-3 text-[#0B214A] placeholder-[#5A6B85] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B214A]/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-[#0B214A] text-white px-4 py-2.5 text-sm font-semibold hover:opacity-95 disabled:opacity-50"
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

        {/* Result */}
        {accident && (
          <div className="mt-6 bg-white border border-[#E4E9F2] rounded-2xl shadow p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#0B214A]">
                  Tracking ID: {accident.trackingId}
                </h2>
                <p className="text-sm text-[#5A6B85]">
                  {accident.accidentType?.replaceAll('_', ' ') || 'Accident'}
                </p>
              </div>
              <StatusPill status={accident.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-[#F0F2F7] bg-[#F5F7FB] p-3">
                <div className="text-xs uppercase tracking-wide text-[#5A6B85]">
                  Reported
                </div>
                <div className="mt-0.5 font-semibold">
                  {accident.createdAt
                    ? new Date(accident.createdAt).toLocaleString()
                    : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-[#F0F2F7] bg-[#F5F7FB] p-3">
                <div className="text-xs uppercase tracking-wide text-[#5A6B85]">
                  Note Count
                </div>
                <div className="mt-0.5 font-semibold">
                  {accident.notesCount || 0}
                </div>
              </div>
              <div className="rounded-lg border border-[#F0F2F7] bg-[#F5F7FB] p-3">
                <div className="text-xs uppercase tracking-wide text-[#5A6B85]">
                  Last Updated
                </div>
                <div className="mt-0.5 font-semibold">
                  {accident.lastUpdated
                    ? new Date(accident.lastUpdated).toLocaleString()
                    : '—'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-md font-semibold text-[#0B214A]">
                Investigation Notes
              </h3>
              {Array.isArray(accident.investigationNotes) &&
              accident.investigationNotes.length > 0 ? (
                <ul className="space-y-3">
                  {accident.investigationNotes.map((n, idx) => (
                    <li
                      key={n._id || idx}
                      className="rounded-lg border border-[#F0F2F7] bg-[#FFFBEA] p-3"
                    >
                      <div className="text-sm text-[#0B214A]">{n.note}</div>
                      <div className="mt-1 text-xs text-[#5A6B85]">
                        {n.addedBy ? `By ${n.addedBy} • ` : ''}
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#5A6B85]">
                  No notes available yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
