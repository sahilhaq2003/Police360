import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import { Link } from "react-router-dom";

// Export utilities
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PLogo from '../../assets/PLogo.png';

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
  const location = useLocation();
  const [recentChanges, setRecentChanges] = useState(location.state?.updatedFields || null);

  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [banner, setBanner] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

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

  // Dismiss recent changes (clear navigation state so it doesn't reappear)
  const dismissRecent = () => {
    setRecentChanges(null);
    // replace history state to remove the diff so refresh won't show it again
    navigate(location.pathname, { replace: true, state: {} });
  };

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

  //Export functions (PDF)
  const exportPDF = () => {
    if (!c) return;
    const doc = new jsPDF();
    // Header with logo and agency text
    const img = PLogo; // imported asset
    // draw image on the left  (x, y, width, height)
    try {
      // jsPDF accepts data URLs or imported image paths when bundler inlines them
      doc.addImage(img, 'PNG', 14, 8, 28, 28);
    } catch (e) {
      // fallback: ignore if image can't be added (some bundlers require base64)
      // console.warn('Failed to add logo to PDF', e);
    }

    doc.setFontSize(16);
    doc.text('Police360 — Complaint Details', 48, 18);
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 48, 26);

    const tableColumn = ['Field', 'Value'];
    const rows = [
      ['ID', c._id || '—'],
      ['Complainant', c.complainant?.name || '—'],
      ['Type', c.complaintDetails?.typeOfComplaint || '—'],
      ['Location', c.complaintDetails?.location || '—'],
      ['Reported At', c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'],
      ['Status', c.status || '—'],
      ['Assigned Officer', c.assignedOfficer?.name || c.assignedOfficer?.officerId || '—'],
      ['Notes Count', Array.isArray(c.investigationNotes) ? String(c.investigationNotes.length) : '0'],
      ['Attachments', attachments.length ? String(attachments.length) : '0'],
      ['ID Type', c.idInfo?.idType || '—'],
      ['ID Value', c.idInfo?.idValue || '—'],
      ['Priority', c.priority || '—'],
      ['Estimated Loss', c.estimatedLoss || '—'],
      ['Description', c.complaintDetails?.description || '—'],
      ['Last Updated', c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '—'],
    ];

    // Start table below header (y ~ 40 to account for logo + text)
    autoTable(doc, {
      head: [tableColumn],
      body: rows,
      startY: 44,
    });

    // If investigation notes exist, add them as a second table
    if (Array.isArray(c.investigationNotes) && c.investigationNotes.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Investigation Notes', 14, 16);
      const notesRows = c.investigationNotes.map((n, i) => [String(i + 1), n.note || '']);
      autoTable(doc, {
        head: [['#', 'Note']],
        body: notesRows,
        startY: 24,
      });
    }

    doc.save(`case-${c._id || 'export'}.pdf`);
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
            <button onClick={() => navigate('/it/cases')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">← Back</button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          {recentChanges && recentChanges.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-md font-semibold">Recent Changes</h4>
                  <p className="text-sm text-slate-600">Fields changed by your last update</p>
                </div>
                <div>
                  <button onClick={dismissRecent} className="text-sm text-indigo-700 underline">Dismiss</button>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {recentChanges.map((d, i) => (
                  <li key={i} className="rounded-md bg-white border p-2">
                    <div className="font-medium">{d.path}</div>
                    <div className="text-xs text-slate-600">Before: <span className="text-rose-700">{String(d.before ?? '—')}</span></div>
                    <div className="text-xs text-slate-600">After: <span className="text-emerald-700">{String(d.after ?? '—')}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
                    {editingNoteId === n._id ? (
                      <div>
                        <textarea value={editingText} onChange={e => setEditingText(e.target.value)} className="w-full border p-2 rounded-md mb-2" />
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            // save edit
                            try {
                              const res = await axiosInstance.put(`/cases/${id}/notes/${n._id}`, { note: editingText });
                              setC(res.data?.data || res.data);
                              setBanner({ type: 'success', message: 'Note updated' });
                              setTimeout(() => setBanner(null), 2500);
                              setEditingNoteId(null);
                              setEditingText('');
                            } catch (err) {
                              setBanner({ type: 'error', message: err?.response?.data?.message || 'Failed to update note' });
                              setTimeout(() => setBanner(null), 2500);
                            }
                          }} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
                          <button onClick={() => { setEditingNoteId(null); setEditingText(''); }} className="px-3 py-1 border rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-slate-900">{n.note}</div>
                        <div className="mt-1 text-xs text-slate-500">{n.author?.name ? `By ${n.author.name} • ` : ''}{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => { setEditingNoteId(n._id); setEditingText(n.note || ''); }} className="text-sm text-indigo-700 underline">Edit</button>
                          <button onClick={async () => {
                            if (!window.confirm('Delete this note?')) return;
                            try {
                              const res = await axiosInstance.delete(`/cases/${id}/notes/${n._id}`);
                              setC(res.data?.data || res.data);
                              setBanner({ type: 'success', message: 'Note deleted' });
                              setTimeout(() => setBanner(null), 2500);
                            } catch (err) {
                              setBanner({ type: 'error', message: err?.response?.data?.message || 'Failed to delete note' });
                              setTimeout(() => setBanner(null), 2500);
                            }
                          }} className="text-sm text-rose-600 underline">Delete</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Add Note / Actions</h3>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="border p-3 w-full rounded-md" placeholder="Add investigation note" />

            <div className="mt-4 flex items-start justify-between gap-4">
              {/* Left side: Add Note + Mark as Closed */}
              <div className="flex items-center gap-3">
                <button onClick={addNote} className="bg-blue-600 shadow hover:opacity-90 transition text-white px-4 py-2 rounded-md">Add Note</button>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
            <div className="mt-4 flex items-start justify-between gap-4">
              {/* Mark as Closed */}
              <div className="flex items-center gap-3">
                <button onClick={closeCase} className="bg-green-600 shadow hover:opacity-90 transition text-white px-4 py-2 rounded-md">Mark as Closed</button>
              </div>

              {/* Right side: Update / Delete / Back */}
              <div className="flex items-center gap-3">
              {/* Export buttons */}
                <button onClick={exportPDF} className="bg-rose-700 shadow hover:opacity-90 transition text-white px-4 py-2 rounded-md">Export PDF</button>
                <Link to={`/cases/update/${c._id}`} className="bg-indigo-600 shadow hover:opacity-90 transition text-white px-4 py-2 rounded-md inline-flex items-center">Update</Link>

                <button onClick={async () => {
                    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
                    try {
                      await axiosInstance.delete(`/cases/${c._id}`);
                      alert("Deleted successfully");
                      navigate("/it/cases"); // go back to cases list
                    } catch (err) {
                      alert(err?.response?.data?.message || "Failed to delete");
                    }
                  }} className="bg-rose-600 shadow hover:opacity-90 transition text-white px-4 py-2 rounded-md">Delete</button>

                <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md border shadow hover:opacity-90 transition">Back</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
