import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const OfficerCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineBox, setShowDeclineBox] = useState(null);
  const [processing, setProcessing] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        const [regularCasesRes, itCasesRes] = await Promise.all([
          axiosInstance.get(`/cases`, { params: { assignedOfficer: id, limit: 100 } }),
          axiosInstance.get(`/it-cases`, { params: { assignedOfficer: id, pageSize: 100 } })
        ]);
        const regularCases = regularCasesRes.data?.data || [];
        const itCases = itCasesRes.data?.data || [];
        setCases([...regularCases, ...itCases]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleView = (c) => {
    // Navigate to officer-specific case details view
    navigate(`/officer/case-details/${c._id}`);
  };

  const handleAccept = async (caseId) => {
    setProcessing(caseId);
    try {
      // Determine if it's an IT case or regular case
      const case_ = cases.find(c => c._id === caseId);
      const isITCase = case_?.caseId && case_.caseId.startsWith('ITCASE-');
      
      const endpoint = isITCase ? `/it-cases/${caseId}/accept` : `/cases/${caseId}/accept`;
      await axiosInstance.post(endpoint);
      
      // Update the case status in the local state
      setCases(prev => prev.map(c => 
        c._id === caseId ? { ...c, status: 'IN_PROGRESS' } : c
      ));
      
      alert('Case accepted successfully!');
    } catch (err) {
      console.error('Error accepting case:', err);
      alert(err?.response?.data?.message || 'Failed to accept case');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (caseId) => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining the case');
      return;
    }

    setProcessing(caseId);
    try {
      // Determine if it's an IT case or regular case
      const case_ = cases.find(c => c._id === caseId);
      const isITCase = case_?.caseId && case_.caseId.startsWith('ITCASE-');
      
      const endpoint = isITCase ? `/it-cases/${caseId}/decline` : `/cases/${caseId}/decline`;
      await axiosInstance.post(endpoint, { reason: declineReason });
      
      // Remove the case from the list since it's declined
      setCases(prev => prev.filter(c => c._id !== caseId));
      
      alert('Case declined successfully!');
      setShowDeclineBox(null);
      setDeclineReason('');
    } catch (err) {
      console.error('Error declining case:', err);
      alert(err?.response?.data?.message || 'Failed to decline case');
    } finally {
      setProcessing(null);
    }
  };

  const toggleDeclineBox = (caseId) => {
    setShowDeclineBox(showDeclineBox === caseId ? null : caseId);
    setDeclineReason('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Assigned Cases</h1>
            <p className="text-sm text-[#5A6B85] mt-1">Cases assigned to you. Review details, add notes and manage investigations.</p>
          </div>
          <div className="ml-4">
            <button onClick={() => navigate('/officer/dashboard')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">← Back to Dashboard</button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-[#5A6B85]">Loading...</div>
        ) : cases.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">No assigned cases.</div>
        ) : (
          <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F5F7FB] text-[#00296B] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Complainant</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c._id} className="border-t border-[#F0F2F7] hover:bg-[#FFFBEA]">
                    <td className="px-4 py-3 align-middle truncate max-w-[160px]">{c.caseId || c._id}</td>
                    <td className="px-4 py-3 align-middle">{c.complainant?.name || '—'}</td>
                    <td className="px-4 py-3 align-middle">{c.complaintDetails?.typeOfComplaint}</td>
                    <td className="px-4 py-3 align-middle truncate max-w-[220px]">{c.complaintDetails?.location}</td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${c.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleView(c)} 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs hover:bg-[#F5F7FB]"
                        >
                          View
                        </button>
                        {(c.status === 'ASSIGNED' || c.status === 'NEW') && (
                          <>
                            <button 
                              onClick={() => handleAccept(c._id)}
                              disabled={processing === c._id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {processing === c._id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button 
                              onClick={() => toggleDeclineBox(c._id)}
                              disabled={processing === c._id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                      {showDeclineBox === c._id && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Please provide a reason for declining this case..."
                            className="w-full p-2 border border-red-300 rounded text-xs resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleDecline(c._id)}
                              disabled={processing === c._id}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {processing === c._id ? 'Declining...' : 'Submit Decline'}
                            </button>
                            <button
                              onClick={() => toggleDeclineBox(c._id)}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
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
};

export default OfficerCases;
