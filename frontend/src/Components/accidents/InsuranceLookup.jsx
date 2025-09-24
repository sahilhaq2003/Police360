import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

function StatusPill({ status }) {
  const map = {
    REPORTED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    UNDER_INVESTIGATION: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    CLOSED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        map[status] || 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAccident(null);

    const c = company.trim();
    const r = ref.trim();

    if (!c || !r) {
      setError('Please enter both Insurance Company and Reference Number.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/accidents', {
        params: { insuranceCompany: c, referenceNumber: r },
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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Insurance Lookup
          </h1>
          <p className="text-sm text-slate-500">
            Enter the insurance company and reference number to view the
            accident.
          </p>

          <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Insurance Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="rounded-xl border-slate-300 shadow-sm h-10 px-3 sm:col-span-1"
            />
            <input
              type="text"
              placeholder="Reference Number"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className="rounded-xl border-slate-300 shadow-sm h-10 px-3 sm:col-span-1"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 sm:col-span-1"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-slate-900">
                  Tracking ID: {accident.trackingId}
                </h2>
                <p className="text-sm text-slate-500">
                  {accident.accidentType?.replaceAll('_', ' ') || 'Accident'}
                </p>
              </div>
              <StatusPill status={accident.status} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-slate-500">Location</div>
                <div className="text-sm font-medium text-slate-900">
                  {accident.locationText || '—'}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-slate-500">Last Updated</div>
                <div className="text-sm font-medium text-slate-900">
                  {accident.updatedAt
                    ? new Date(accident.updatedAt).toLocaleString()
                    : '—'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-md font-semibold text-slate-900">
                Investigation Notes (
                {Array.isArray(accident.investigationNotes)
                  ? accident.investigationNotes.length
                  : 0}
                )
              </h3>
              {Array.isArray(accident.investigationNotes) &&
              accident.investigationNotes.length > 0 ? (
                <ul className="space-y-3">
                  {accident.investigationNotes.map((n, idx) => (
                    <li
                      key={n._id || idx}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="text-sm text-slate-900">{n.note}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {n.addedBy ? `By ${n.addedBy} • ` : ''}
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">
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
