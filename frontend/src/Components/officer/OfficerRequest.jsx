import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const OfficerRequest = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('Report Issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/requests/my');
      setMyRequests(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRequests();
  }, []);

  // Ensure page is scrolled to top on navigation to this page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await axiosInstance.post('/requests', { type, subject, description });
      setSuccess('Request submitted successfully');
      setSubject('');
      setDescription('');
      loadMyRequests();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Officer Requests</h1>
          <button onClick={() => navigate(-1)} className="text-sm px-3 py-2 rounded-lg border border-[#E4E9F2] bg-white hover:bg-[#F8FAFF]">Back</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Create Request</h2>
            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>
            )}
            {success && (
              <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">{success}</div>
            )}
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="text-sm text-[#5A6B85]">Type</label>
                <select
                  className="w-full mt-1 border border-[#D6DEEB] rounded-lg px-3 py-2 bg-white"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>Report Issue</option>
                  <option>Request Appointment</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[#5A6B85]">Subject</label>
                <input
                  className="w-full mt-1 border border-[#D6DEEB] rounded-lg px-3 py-2 bg-white"
                  placeholder="Short subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-[#5A6B85]">Description</label>
                <textarea
                  className="w-full mt-1 border border-[#D6DEEB] rounded-lg px-3 py-2 bg-white min-h-36"
                  placeholder="Describe your issue or appointment request in detail"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-[#0B214A] text-white disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6">
            <h2 className="text-lg font-semibold mb-4">My Previous Requests</h2>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-10 bg-[#EEF2F7] rounded-lg" />
                <div className="h-10 bg-[#EEF2F7] rounded-lg" />
                <div className="h-10 bg-[#EEF2F7] rounded-lg" />
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-sm text-[#5A6B85]">No requests yet.</div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div key={req._id} className="px-4 py-3 rounded-lg border border-[#EEF2F7]">
                    <div className="text-sm font-medium">{req.type} • {req.subject}</div>
                    <div className="text-[11px] text-[#5A6B85]">{new Date(req.createdAt).toLocaleString()}</div>
                    <div className="text-[12px] mt-1">{req.description}</div>
                    {req.type === 'Request Appointment' && req.appointmentDate && (
                      <div className="text-[12px] mt-1"><span className="font-semibold">Scheduled:</span> {new Date(req.appointmentDate).toLocaleString()}</div>
                    )}
                    <span className={`inline-block mt-2 text-[11px] font-semibold px-2 py-1 rounded-md ${
                      req.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                      req.status === 'Denied' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {req.status}
                    </span>
                    {Array.isArray(req.replies) && req.replies.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-[#5A6B85]">Admin Replies:</div>
                        {req.replies.map((rep, idx) => (
                          <div key={idx} className="text-xs bg-[#F7FAFF] border border-[#E4E9F2] rounded px-2 py-1">
                            <span className="font-semibold">Admin:</span> {rep.message}
                            <span className="ml-2 text-[10px] text-[#6B7A99]">{new Date(rep.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerRequest;


