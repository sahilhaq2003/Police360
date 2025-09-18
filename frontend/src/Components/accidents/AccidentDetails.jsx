import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAccidentById } from '../../utils/accidentapi';
import AccidentUpdatePanel from './AccidentUpdatePanel';
import DeleteAccident from './DeleteAccident';

function LabelRow({ label, children }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-2">
      <div className="col-span-4 md:col-span-3 text-sm font-medium text-slate-600">
        {label}
      </div>
      <div className="col-span-8 md:col-span-9 text-sm text-slate-900">
        {children ?? '—'}
      </div>
    </div>
  );
}

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
      {status?.replaceAll('_', ' ')}
    </span>
  );
}

export default function AccidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [accident, setAccident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [banner, setBanner] = useState(null); // feedback from child updates

  // fetch once per id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await getAccidentById(id);
        if (mounted) setAccident(data);
      } catch (e) {
        if (mounted) {
          setErr(
            e?.response?.data?.message ||
              e?.message ||
              'Failed to load accident'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const evidence = useMemo(() => accident?.evidence || [], [accident]);

  // loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-40 w-full bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // error state
  if (err) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {err}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (!accident) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {accident.trackingId ?? 'Accident'}
              </h1>
              <p className="text-sm text-slate-500">Accident details</p>
            </div>
            <StatusPill status={accident.status} />
          </div>
        </div>
        {/* Optional banner from updates */}
        {banner && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              banner.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {banner.message}
          </div>
        )}
        {/* Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Overview</h2>
          <LabelRow label="Type">
            {accident.accidentType?.replaceAll('_', ' ')}
          </LabelRow>
          <LabelRow label="Emergency">
            {accident.isEmergency ? 'Yes' : 'No'}
          </LabelRow>
          <LabelRow label="Location">{accident.locationText}</LabelRow>
          <LabelRow label="Coordinates">
            {accident.geo?.lat && accident.geo?.lng
              ? `${accident.geo.lat}, ${accident.geo.lng}`
              : '—'}
          </LabelRow>
          <LabelRow label="NIC">{accident.nic || '—'}</LabelRow>
          <LabelRow label="Reported at">
            {accident.createdAt && !isNaN(new Date(accident.createdAt))
              ? new Date(accident.createdAt).toLocaleString()
              : '—'}
          </LabelRow>
          <LabelRow label="Last updated">
            {accident.updatedAt && !isNaN(new Date(accident.updatedAt))
              ? new Date(accident.updatedAt).toLocaleString()
              : '—'}
          </LabelRow>
        </div>
        {/* Victim */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Victim</h2>
          <LabelRow label="Full Name">{accident.victim?.fullName}</LabelRow>
          <LabelRow label="Phone">{accident.victim?.phone}</LabelRow>
          <LabelRow label="Email">{accident.victim?.email}</LabelRow>
          <LabelRow label="Address">{accident.victim?.address}</LabelRow>
          <LabelRow label="Insurance Company">
            {accident.victim?.insuranceCompany}
          </LabelRow>
          <LabelRow label="Policy No.">
            {accident.victim?.insurancePolicyNo}
          </LabelRow>
          <LabelRow label="Insurance Ref">
            {accident.victim?.insuranceRefNo ?? '—'}
          </LabelRow>
        </div>
        {/* Vehicle */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Vehicle</h2>
          <LabelRow label="Plate No.">{accident.vehicle?.plateNo}</LabelRow>
          <LabelRow label="Make">{accident.vehicle?.make}</LabelRow>
          <LabelRow label="Model">{accident.vehicle?.model}</LabelRow>
          <LabelRow label="Color">{accident.vehicle?.color}</LabelRow>
          <LabelRow label="Owner NIC">{accident.vehicle?.ownerNIC}</LabelRow>
        </div>
        {/* Evidence */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Evidence</h2>
          {Array.isArray(evidence) && evidence.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {evidence.map((ev, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {typeof ev === 'string' && ev.startsWith('data:video') ? (
                    <video
                      src={ev}
                      controls
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <img
                      src={ev}
                      alt={`evidence-${i}`}
                      className="h-40 w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No evidence uploaded.</p>
          )}
        </div>
        {/* Existing notes */}
        {Array.isArray(accident.investigationNotes) &&
          accident.investigationNotes.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-slate-900">
                Investigation Notes
              </h2>
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
            </div>
          )}
        {/* Update / Add note panel */}
        <AccidentUpdatePanel
          accident={accident}
          onUpdated={(updated) => {
            setAccident(updated);
            setBanner({ type: 'success', message: 'Updated successfully.' });
            setTimeout(() => setBanner(null), 2500);
          }}
        />
        {/* Back */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            ← Back
          </button>
        </div>
        {/* Delete Accident */}
        <div className="flex justify-center">
          <DeleteAccident accidentId={accident._id} />
        </div>
      </div>
    </div>
  );
}
