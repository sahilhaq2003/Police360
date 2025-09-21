import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

function LabelRow({ label, children }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-2">
      <div className="col-span-4 md:col-span-3 text-sm font-medium text-slate-600">{label}</div>
      <div className="col-span-8 md:col-span-9 text-sm text-slate-900">{children ?? '—'}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    NEW: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    ASSIGNED: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    CLOSED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'}`}>
      {status?.replaceAll('_',' ')}
    </span>
  );
}

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [banner, setBanner] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await axiosInstance.get(`/cases/${id}`);
        const data = res.data?.data || res.data;
        if (mounted) setC(data);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || e?.message || 'Failed to load case');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const attachments = useMemo(() => c?.attachments || [], [c]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mx-auto max-w-4xl">
            <div className="h-8 w-48 bg-[#E6ECF6] rounded animate-pulse mb-4" />
            <div className="h-40 w-full bg-[#E6ECF6] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{err}</div>
            <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#D6DEEB] text-sm hover:bg-[#F5F7FB]">← Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (!c) return null;

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      const res = await axiosInstance.post(`/cases/${id}/notes`, { note: noteText });
      setC(res.data?.data || res.data);
      setNoteText('');
      setBanner({ type: 'success', message: 'Note added' });
      setTimeout(() => setBanner(null), 2500);
    } catch (e) {
      setBanner({ type: 'error', message: e?.response?.data?.message || 'Failed to add note' });
      setTimeout(() => setBanner(null), 2500);
    }
  };

  const closeCase = async () => {
    try {
      await axiosInstance.post(`/cases/${id}/close`);
      setBanner({ type: 'success', message: 'Case closed' });
      setTimeout(() => { setBanner(null); navigate('/it/cases'); }, 1200);
    } catch (e) {
      setBanner({ type: 'error', message: e?.response?.data?.message || 'Failed to close' });
      setTimeout(() => setBanner(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Case Details</h1>
          <p className="text-sm text-[#5A6B85] mt-1">Review and update complaint investigation</p>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{c.complainant?.name ?? 'Case'}</h2>
                <p className="text-sm text-[#5A6B85]">Submitted at {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</p>
              </div>
              <StatusPill status={c.status} />
            </div>
          </div>

          {banner && (
            <div className={`rounded-xl px-4 py-3 text-sm ${banner.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>{banner.message}</div>
          )}

          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Overview</h3>
            <LabelRow label="Type">{c.complaintDetails?.typeOfComplaint}</LabelRow>
            <LabelRow label="Location">{c.complaintDetails?.location}</LabelRow>
            <LabelRow label="Description">{c.complaintDetails?.description}</LabelRow>
            <LabelRow label="Assigned Officer">{c.assignedOfficer ? (c.assignedOfficer.name || c.assignedOfficer.officerId) : '—'}</LabelRow>
            <LabelRow label="Reported at">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</LabelRow>
            <LabelRow label="Last updated">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '—'}</LabelRow>
          </div>

          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Attachments</h3>
            {attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {attachments.map((a, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-slate-200">
                    {typeof a === 'string' && a.startsWith('data:video') ? (
                      <video src={a} controls className="h-40 w-full object-cover" />
                    ) : (
                      <img src={a} alt={`att-${i}`} className="h-40 w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No attachments uploaded.</p>
            )}
          </div>

          {Array.isArray(c.investigationNotes) && c.investigationNotes.length > 0 && (
            <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold">Investigation Notes</h3>
              <ul className="space-y-3">
                {c.investigationNotes.map((n, idx) => (
                  <li key={n._id || idx} className="rounded-lg border border-[#EEF2F7] bg-[#F9FBFF] p-3">
                    <div className="text-sm text-slate-900">{n.note}</div>
                    <div className="mt-1 text-xs text-slate-500">{n.author?.name ? `By ${n.author.name} • ` : ''}{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Add Note / Actions</h3>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="border p-2 w-full" placeholder="Add investigation note" />
            <div className="mt-3 flex gap-2">
              <button onClick={addNote} className="bg-blue-600 text-white px-3 py-1 rounded">Add Note</button>
              <button onClick={closeCase} className="bg-green-600 text-white px-3 py-1 rounded">Mark as Closed</button>
              <button onClick={() => navigate(-1)} className="px-3 py-1 rounded border">Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
