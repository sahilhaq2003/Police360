import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import { Link } from "react-router-dom";

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

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this complaint?")) return;
  try {
    await axiosInstance.delete(`/cases/${id}`);
    setCases(prev => prev.filter(item => item._id !== id));
    alert("Deleted successfully");
  } catch (err) {
    alert(err?.response?.data?.message || "Failed to delete");
  }
};

  // Delete current case and navigate back to cases list
  const deleteCurrentCase = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await axiosInstance.delete(`/cases/${c._id}`);
      setBanner({ type: 'success', message: 'Deleted successfully' });
      setTimeout(() => navigate('/it/cases'), 800);
    } catch (err) {
      console.error('delete case error', err);
      setBanner({ type: 'error', message: err?.response?.data?.message || 'Failed to delete' });
      setTimeout(() => setBanner(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Complaint Details</h1>
            <p className="text-sm text-[#5A6B85] mt-1">Review and update complaint investigation</p>
          </div>
          <div className="absolute right-0 top-0">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">← Back</button>
          </div>
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
            <LabelRow label="ID Type">{c.idInfo?.idType || '—'}</LabelRow>
            <LabelRow label="ID Value">{c.idInfo?.idValue || '—'}</LabelRow>
            <LabelRow label="Priority">{c.priority || '—'}</LabelRow>
            <LabelRow label="Estimated Loss">{c.estimatedLoss || '—'}</LabelRow>
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

          {/* Additional Information display */}
          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Additional Information</h3>

            {/* Witnesses */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Witnesses</h4>
              {(c.additionalInfo?.witnesses || []).length > 0 ? (
                <ul className="space-y-2">
                  {c.additionalInfo.witnesses.map((w, i) => (
                    <li key={i} className="border rounded p-3">
                      <div className="text-sm font-medium">{w.name || '—'}</div>
                      <div className="text-xs text-slate-600">Phone: {w.phone || '—'}</div>
                      <div className="text-xs text-slate-600">ID: {w.id || '—'}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-600">No witnesses provided.</div>
              )}
            </div>

            {/* Suspects */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Suspects</h4>
              {(c.additionalInfo?.suspects || []).length > 0 ? (
                <div className="space-y-3">
                  {c.additionalInfo.suspects.map((s, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="text-sm font-medium">{s.name || '—'}</div>
                      <div className="text-xs text-slate-600 mb-2">Appearance: {s.appearance || '—'}</div>
                      {Array.isArray(s.photos) && s.photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {s.photos.map((p, j) => (
                            <div key={j} className="overflow-hidden rounded border">
                              {typeof p === 'string' && p.startsWith('data:video') ? (
                                <video src={p} controls className="h-24 w-full object-cover" />
                              ) : (
                                <img src={p} alt={`suspect-${i}-${j}`} className="h-24 w-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-600">No suspects provided.</div>
              )}
            </div>

            {/* Evidence */}
            <div>
              <h4 className="font-medium mb-2">Evidence</h4>
              {(c.additionalInfo?.evidence || []).length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {c.additionalInfo.evidence.map((evi, idx) => (
                    <div key={idx} className="overflow-hidden rounded-xl border border-slate-200">
                      {typeof evi === 'string' && evi.startsWith('data:video') ? (
                        <video src={evi} controls className="h-40 w-full object-cover" />
                      ) : (
                        <img src={evi} alt={`evi-${idx}`} className="h-40 w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-600">No evidence uploaded.</div>
              )}
            </div>
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
  {/* Add Note */}
  <button
    onClick={addNote}
    className="bg-blue-600 text-white px-3 py-1 rounded"
  >
    Add Note
  </button>

  {/* Close Case */}
  <button
    onClick={closeCase}
    className="bg-green-600 text-white px-3 py-1 rounded"
  >
    Mark as Closed
  </button>

  {/* Update Complaint (Edit) */}
  <Link
    to={`/cases/update/${c._id}`}
    className="bg-indigo-600 text-white px-3 py-1 rounded inline-flex items-center"
  >
    Update
  </Link>

  <button
  onClick={async () => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await axiosInstance.delete(`/cases/${c._id}`);
      alert("Deleted successfully");
      navigate("/it/cases"); // go back to cases list
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  }}
  className="bg-rose-600 text-white px-3 py-1 rounded"
>
  Delete
</button>

  {/* Back */}
  <button
    onClick={() => navigate(-1)}
    className="px-3 py-1 rounded border"
  >
    Back
  </button>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}
