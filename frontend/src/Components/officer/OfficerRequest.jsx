import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import {
  ArrowLeft,
  FileText,
  Send,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Loader2,
  Plus,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock4,
} from 'lucide-react';

const OfficerRequest = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('Report Issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
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
    
    // Validate leave dates for leave requests
    if (type === 'Leave Request') {
      if (!leaveStartDate || !leaveEndDate) {
        setError('Leave start date and end date are required for leave requests');
        return;
      }
      if (new Date(leaveStartDate) > new Date(leaveEndDate)) {
        setError('Leave start date cannot be after end date');
        return;
      }
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const requestData = { type, subject, description };
      
      // Add leave dates for leave requests
      if (type === 'Leave Request') {
        requestData.leaveStartDate = leaveStartDate;
        requestData.leaveEndDate = leaveEndDate;
      }
      
      await axiosInstance.post('/requests', requestData);
      setSuccess('Request submitted successfully');
      setSubject('');
      setDescription('');
      setLeaveStartDate('');
      setLeaveEndDate('');
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B214A] to-[#1E3A8A] flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0B214A]">Officer Requests</h1>
                <p className="text-sm text-[#5A6B85] mt-1">Submit requests and track their status with the administration</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E4E9F2] bg-white hover:bg-[#F8FAFF] hover:shadow-md transition-all duration-200 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Create Request Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow-lg overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-[#0B214A] to-[#1E3A8A] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Create New Request</h2>
                </div>
                <p className="text-sm text-blue-100 mt-1">Submit your request to the administration team</p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {/* Enhanced Error/Success Messages */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-400 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 rounded-xl bg-green-50 border-l-4 border-green-400 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{success}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={submitRequest} className="space-y-6">
                  {/* Request Type */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                      <FileText className="w-4 h-4" />
                      Request Type
                    </label>
                    <div className="relative">
                      <select
                        className="w-full border border-[#D6DEEB] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent transition-all duration-200 text-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value="Report Issue">Report Issue</option>
                        <option value="Request Appointment">Request Appointment</option>
                        <option value="Equipment Request">Equipment Request</option>
                        <option value="Leave Request">Leave Request</option>
                        <option value="Training Request">Training Request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                      <MessageSquare className="w-4 h-4" />
                      Subject
                    </label>
                    <input
                      className="w-full border border-[#D6DEEB] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent transition-all duration-200 text-sm placeholder-[#9CA3AF]"
                      placeholder="Enter a brief subject for your request"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                      <AlertTriangle className="w-4 h-4" />
                      Description
                    </label>
                    <textarea
                      className="w-full border border-[#D6DEEB] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent transition-all duration-200 text-sm placeholder-[#9CA3AF] min-h-32 resize-none"
                      placeholder="Provide detailed information about your request..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                    />
                    <div className="text-xs text-[#6B7280] text-right">
                      {description.length}/500 characters
                    </div>
                  </div>

                  {/* Leave Date Fields - Only show for Leave Request */}
                  {type === 'Leave Request' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Leave Start Date */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                            <CalendarDays className="w-4 h-4" />
                            Leave Start Date
                          </label>
                          <input
                            type="date"
                            className="w-full border border-[#D6DEEB] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent transition-all duration-200 text-sm"
                            value={leaveStartDate}
                            onChange={(e) => setLeaveStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        {/* Leave End Date */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                            <CalendarDays className="w-4 h-4" />
                            Leave End Date
                          </label>
                          <input
                            type="date"
                            className="w-full border border-[#D6DEEB] rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent transition-all duration-200 text-sm"
                            value={leaveEndDate}
                            onChange={(e) => setLeaveEndDate(e.target.value)}
                            min={leaveStartDate || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      
                      {/* Leave Duration Display */}
                      {leaveStartDate && leaveEndDate && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-blue-800">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              Leave Duration: {Math.ceil((new Date(leaveEndDate) - new Date(leaveStartDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting || !subject.trim() || !description.trim() || (type === 'Leave Request' && (!leaveStartDate || !leaveEndDate))}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B214A] to-[#1E3A8A] text-white font-semibold hover:from-[#1E3A8A] hover:to-[#0B214A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Enhanced Request History */}
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow-lg overflow-hidden">
            {/* History Header */}
            <div className="bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] px-6 py-4 border-b border-[#E4E9F2]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0B214A]/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#0B214A]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B214A]">Request History</h2>
                  <p className="text-xs text-[#5A6B85]">Track your submitted requests</p>
                </div>
              </div>
            </div>

            {/* History Content */}
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-[#EEF2F7] rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-[#EEF2F7] rounded w-1/2 mb-3"></div>
                      <div className="h-8 bg-[#EEF2F7] rounded"></div>
                    </div>
                  ))}
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[#9CA3AF]" />
                  </div>
                  <h3 className="text-sm font-medium text-[#6B7280] mb-1">No requests yet</h3>
                  <p className="text-xs text-[#9CA3AF]">Your submitted requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {myRequests.map((req) => (
                    <div key={req._id} className="p-4 rounded-xl border border-[#E5E7EB] bg-gradient-to-r from-[#FAFBFC] to-[#F8FAFC] hover:shadow-md transition-all duration-200">
                      {/* Request Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-[#0B214A]">{req.type}</span>
                            <span className="text-xs text-[#6B7280]">•</span>
                            <span className="text-xs text-[#6B7280] flex items-center gap-1">
                              <Clock4 className="w-3 h-3" />
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-[#374151] mb-1">{req.subject}</h4>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                          req.status === 'Denied' ? 'bg-red-100 text-red-800 border border-red-200' :
                          req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {req.status === 'Denied' && <X className="w-3 h-3" />}
                          {req.status === 'Pending' && <Clock4 className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </div>

                      {/* Request Description */}
                      <div className="text-xs text-[#6B7280] mb-3 line-clamp-2">
                        {req.description}
                      </div>

                      {/* Appointment Date */}
                      {req.type === 'Request Appointment' && req.appointmentDate && (
                        <div className="flex items-center gap-2 text-xs text-[#0B214A] mb-3 p-2 bg-blue-50 rounded-lg">
                          <CalendarDays className="w-3 h-3" />
                          <span className="font-medium">Scheduled:</span>
                          <span>{new Date(req.appointmentDate).toLocaleString()}</span>
                        </div>
                      )}

                      {/* Admin Replies */}
                      {Array.isArray(req.replies) && req.replies.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-[#6B7280] flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Admin Replies ({req.replies.length})
                          </div>
                          {req.replies.slice(0, 2).map((rep, idx) => (
                            <div key={idx} className="text-xs bg-[#F7FAFF] border border-[#E4E9F2] rounded-lg px-3 py-2">
                              <div className="flex items-start gap-2">
                                <User className="w-3 h-3 text-[#0B214A] mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-[#374151]">{rep.message}</p>
                                  <span className="text-[10px] text-[#9CA3AF] mt-1 block">
                                    {new Date(rep.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {req.replies.length > 2 && (
                            <div className="text-xs text-[#0B214A] font-medium">
                              +{req.replies.length - 2} more replies
                            </div>
                          )}
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
    </div>
  );
};

export default OfficerRequest;


