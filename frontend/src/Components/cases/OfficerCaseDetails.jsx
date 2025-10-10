import React, { useState, useEffect } from 'react';
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
    DECLINED: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    PENDING_CLOSE: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'}`}>
      {status?.replaceAll('_',' ')}
    </span>
  );
}

export default function OfficerCaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        
        // Try to fetch as IT case first, then regular case
        let res;
        try {
          res = await axiosInstance.get(`/it-cases/${id}`);
          if (mounted) setCaseData(res.data?.data || res.data);
        } catch (itError) {
          // If IT case fails, try regular case
          res = await axiosInstance.get(`/cases/${id}`);
          if (mounted) setCaseData(res.data?.data || res.data);
        }
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e?.message || 'Failed to load case');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const addNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      // Determine if it's an IT case or regular case
      const isITCase = caseData?.caseId && caseData.caseId.startsWith('ITCASE-');
      const endpoint = isITCase ? `/it-cases/${id}/notes` : `/cases/${id}/notes`;
      
      const res = await axiosInstance.post(endpoint, { note: noteText });
      setCaseData(res.data?.data || res.data);
      setNoteText('');
    } catch (e) {
      console.error('Failed to add note:', e);
    } finally {
      setAddingNote(false);
    }
  };

  const requestCloseCase = async () => {
    const reason = window.prompt('Please provide a reason for closing this case:');
    if (!reason || !reason.trim()) return;
    
    try {
      // Determine if it's an IT case or regular case
      const isITCase = caseData?.caseId && caseData.caseId.startsWith('ITCASE-');
      const endpoint = isITCase ? `/it-cases/${id}/request-close` : `/cases/${id}/request-close`;
      
      const res = await axiosInstance.post(endpoint, { reason: reason.trim() });
      
      // Check if the response indicates success
      if (res.data?.success || res.status === 200) {
        setCaseData(res.data?.data || res.data);
        alert('Close request submitted successfully. Waiting for IT officer approval.');
      } else {
        throw new Error(res.data?.message || 'Request failed');
      }
    } catch (e) {
      console.error('Failed to request case closure:', e);
      const errorMessage = e?.response?.data?.message || e?.message || 'Failed to submit close request. Please try again.';
      alert(errorMessage);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
            <button onClick={() => navigate('/officer/reports')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#D6DEEB] text-sm hover:bg-[#F5F7FB]">← Back to Assigned Cases</button>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mx-auto max-w-4xl">
          
          {/* Header */}
          <div className="mb-8 relative">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight">Case Details</h1>
              <p className="text-sm text-[#5A6B85] mt-1">Case ID: {caseData.caseId || caseData._id}</p>
            </div>
            <div className="absolute right-0 top-0">
              <button 
                onClick={() => navigate('/officer/reports')} 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
              >
                ← Back to Assigned Cases
              </button>
            </div>
          </div>

          {/* Case Status */}
          <div className="mb-6 text-center">
            <StatusPill status={caseData.status} />
          </div>

          {/* Case Information */}
          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Case Information</h3>
            <div className="space-y-1">
              <LabelRow label="Case ID">{caseData.caseId || caseData._id}</LabelRow>
              <LabelRow label="Status">{caseData.status}</LabelRow>
              <LabelRow label="Priority">{caseData.priority || 'MEDIUM'}</LabelRow>
              <LabelRow label="Lead Officer">
                {caseData.assignedOfficer ? (
                  <div>
                    <div className="font-medium">{caseData.assignedOfficer.name || 'Unknown Officer'}</div>
                    <div className="text-xs text-slate-500">
                      ID: {caseData.assignedOfficer.officerId || 'N/A'} | 
                      Department: {caseData.assignedOfficer.department || 'N/A'}
                    </div>
                  </div>
                ) : (
                  'No officer assigned'
                )}
              </LabelRow>
              <LabelRow label="Created">{new Date(caseData.createdAt).toLocaleString()}</LabelRow>
              <LabelRow label="Last Updated">{new Date(caseData.updatedAt).toLocaleString()}</LabelRow>
            </div>
          </div>

          {/* Complainant Information */}
          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Complainant Information</h3>
            <div className="space-y-1">
              <LabelRow label="Name">{caseData.complainant?.name}</LabelRow>
              <LabelRow label="Phone">{caseData.complainant?.phone}</LabelRow>
              <LabelRow label="Email">{caseData.complainant?.email}</LabelRow>
              <LabelRow label="Address">{caseData.complainant?.address}</LabelRow>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Complaint Details</h3>
            <div className="space-y-1">
              <LabelRow label="Type of Complaint">{caseData.complaintDetails?.typeOfComplaint}</LabelRow>
              <LabelRow label="Incident Date">{caseData.complaintDetails?.incidentDate ? new Date(caseData.complaintDetails.incidentDate).toLocaleDateString() : '—'}</LabelRow>
              <LabelRow label="Location">{caseData.complaintDetails?.location}</LabelRow>
              <LabelRow label="Description">
                <div className="whitespace-pre-wrap">{caseData.complaintDetails?.description}</div>
              </LabelRow>
            </div>
          </div>

          {/* IT Officer Analysis (if available) */}
          {caseData.itOfficerDetails && (
            <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">IT Officer Analysis</h3>
              <div className="space-y-1">
                <LabelRow label="Urgency Level">{caseData.itOfficerDetails?.urgencyLevel}</LabelRow>
                <LabelRow label="Assigned Department">{caseData.itOfficerDetails?.assignedDepartment}</LabelRow>
                <LabelRow label="Case Analysis">
                  <div className="whitespace-pre-wrap">{caseData.itOfficerDetails?.caseAnalysis}</div>
                </LabelRow>
                <LabelRow label="Technical Details">
                  <div className="whitespace-pre-wrap">{caseData.itOfficerDetails?.technicalDetails}</div>
                </LabelRow>
                <LabelRow label="Recommended Actions">
                  <div className="whitespace-pre-wrap">{caseData.itOfficerDetails?.recommendedActions}</div>
                </LabelRow>
              </div>
            </div>
          )}

          {/* Investigation Notes */}
          {caseData.investigationNotes && caseData.investigationNotes.length > 0 && (
            <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Investigation Notes</h3>
              <div className="space-y-3">
                {caseData.investigationNotes.map((note, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        {typeof note.author === 'object' ? note.author.name : 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Note Section */}
          <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow mb-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Add Investigation Note</h3>
            <textarea 
              value={noteText} 
              onChange={e => setNoteText(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-md mb-4" 
              placeholder="Add your investigation note here..."
              rows={4}
            />
            <button 
              onClick={addNote}
              disabled={addingNote || !noteText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>

          {/* Case Actions */}
          {caseData.status !== 'CLOSED' && caseData.status !== 'PENDING_CLOSE' && (
            <div className="rounded-2xl border border-[#EEF2F7] bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Case Actions</h3>
              <div className="flex gap-3">
                <button 
                  onClick={requestCloseCase}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Request Case Closure
                </button>
              </div>
            </div>
          )}

          {/* Close Request Status */}
          {caseData.status === 'PENDING_CLOSE' && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow">
              <h3 className="text-lg font-semibold text-orange-800 mb-4">Close Request Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Pending IT Officer Approval
                  </span>
                </div>
                {caseData.closeRequest && (
                  <div className="text-sm text-orange-700">
                    <p><strong>Requested by:</strong> {caseData.closeRequest.requestedBy?.name || 'Unknown'}</p>
                    <p><strong>Requested on:</strong> {new Date(caseData.closeRequest.requestedAt).toLocaleString()}</p>
                    <p><strong>Reason:</strong> {caseData.closeRequest.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Previous Close Request History */}
          {caseData.closeRequest && (caseData.closeRequest.declinedBy || caseData.closeRequest.approvedBy) && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Close Request History</h3>
              <div className="space-y-2">
                {caseData.closeRequest.declinedBy && (
                  <div className="text-sm text-red-700">
                    <p><strong>Declined by:</strong> {caseData.closeRequest.declinedBy?.name || 'Unknown'}</p>
                    <p><strong>Declined on:</strong> {new Date(caseData.closeRequest.declinedAt).toLocaleString()}</p>
                    <p><strong>Decline reason:</strong> {caseData.closeRequest.declineReason}</p>
                  </div>
                )}
                {caseData.closeRequest.approvedBy && (
                  <div className="text-sm text-green-700">
                    <p><strong>Approved by:</strong> {caseData.closeRequest.approvedBy?.name || 'Unknown'}</p>
                    <p><strong>Approved on:</strong> {new Date(caseData.closeRequest.approvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
