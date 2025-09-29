import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  CheckCircle,
  XCircle,
  Send,
  ArrowLeft,
  FileText,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Loader2,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock4,
  Search,
  Filter,
  Eye,
  Calendar,
  Shield,
  Users,
  TrendingUp,
  Trash2,
} from "lucide-react";
import AdminHeader from "../AdminHeader/AdminHeader";

const ViewRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [appointmentInputs, setAppointmentInputs] = useState({});
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, denied: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [appointmentErrors, setAppointmentErrors] = useState({});

  // Get current datetime in YYYY-MM-DDTHH:mm format for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Validate appointment date
  const validateAppointmentDate = (dateTime) => {
    if (!dateTime) {
      return 'Please select an appointment date and time';
    }
    const selectedDate = new Date(dateTime);
    const now = new Date();
    
    if (selectedDate <= now) {
      return 'Please select a future date and time for the appointment';
    }
    return '';
  };

  // Handle appointment date change
  const handleAppointmentChange = (requestId, value) => {
    setAppointmentInputs((prev) => ({
      ...prev,
      [requestId]: value,
    }));
    
    // Clear error when user changes date
    setAppointmentErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[requestId];
      return newErrors;
    });
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/requests");
      const requestsData = res.data?.data || [];
      setRequests(requestsData);
      
      // Calculate stats
      const statsData = {
        total: requestsData.length,
        pending: requestsData.filter(r => r.status === 'Pending').length,
        approved: requestsData.filter(r => r.status === 'Approved').length,
        denied: requestsData.filter(r => r.status === 'Denied').length,
      };
      setStats(statsData);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status, appointmentDate) => {
    setUpdatingId(id);
    setError("");
    
    // Validate appointment date if provided
    if (appointmentDate) {
      const validationError = validateAppointmentDate(appointmentDate);
      if (validationError) {
        setAppointmentErrors((prev) => ({
          ...prev,
          [id]: validationError,
        }));
        setUpdatingId("");
        return;
      }
    }
    
    try {
      const body = appointmentDate ? { status, appointmentDate } : { status };
      const res = await axiosInstance.put(`/requests/${id}`, body);
      const updated = res.data?.data || { _id: id, status };
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...updated } : r))
      );
      
      // Clear appointment error on successful update
      if (appointmentDate) {
        setAppointmentErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId("");
    }
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) return;
    setError("");
    setReplyingId(id);
    try {
      const res = await axiosInstance.post(`/requests/${id}/replies`, {
        message: replyText.trim(),
      });
      const updated = res.data?.data;
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? updated : r))
      );
      setReplyText("");
      setReplyingId("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send reply");
      setReplyingId("");
    }
  };

  const deleteRequest = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      await axiosInstance.delete(`/requests/${id}`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      
      // Update stats
      const updatedRequests = requests.filter((r) => r._id !== id);
      const statsData = {
        total: updatedRequests.length,
        pending: updatedRequests.filter(r => r.status === 'Pending').length,
        approved: updatedRequests.filter(r => r.status === 'Approved').length,
        denied: updatedRequests.filter(r => r.status === 'Denied').length,
      };
      setStats(statsData);
      
      setShowDeleteConfirm(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete request");
    } finally {
      setDeletingId("");
    }
  };

  const normalized = (s) => (s || "").toString().toLowerCase();
  const filtered = requests.filter((r) => {
    // Type filter
    if (typeFilter !== "All" && r.type !== typeFilter) return false;
    
    // Status filter
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    
    // Search filter
    const q = normalized(search);
    if (!q) return true;
    const officerName = normalized(r.officerId?.name);
    const subject = normalized(r.subject);
    const description = normalized(r.description);
    const status = normalized(r.status);
    return (
      officerName.includes(q) ||
      subject.includes(q) ||
      description.includes(q) ||
      status.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B214A] to-[#1E3A8A] flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0B214A]">Officer Request Management</h1>
                <p className="text-sm text-[#5A6B85] mt-1">Review and manage officer requests from the department</p>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-[#E4E9F2] shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5A6B85]">Total Requests</p>
                  <p className="text-2xl font-bold text-[#0B214A]">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#0B214A]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#0B214A]" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E9F2] shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5A6B85]">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock4 className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E9F2] shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5A6B85]">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E9F2] shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#5A6B85]">Denied</p>
                  <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-[#0B214A]" />
            <h3 className="text-lg font-semibold text-[#0B214A]">Filters & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[#5A6B85] mb-2">Request Type</label>
              <select
                className="w-full border border-[#D6DEEB] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Report Issue">Report Issue</option>
                <option value="Request Appointment">Request Appointment</option>
                <option value="Equipment Request">Equipment Request</option>
                <option value="Leave Request">Leave Request</option>
                <option value="Training Request">Training Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#5A6B85] mb-2">Status</label>
              <select
                className="w-full border border-[#D6DEEB] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5A6B85] mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <input
                  className="w-full pl-10 pr-4 py-2 border border-[#D6DEEB] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent text-sm placeholder-[#9CA3AF]"
                  placeholder="Search by officer name, subject, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow-lg overflow-hidden">
          {/* Content Header */}
          <div className="bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] px-6 py-4 border-b border-[#E4E9F2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0B214A]/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#0B214A]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B214A]">Officer Requests</h3>
                  <p className="text-xs text-[#5A6B85]">
                    {filtered.length} of {requests.length} requests
                    {search && ` matching "${search}"`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-[#EEF2F7] rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                  <FileText className="w-10 h-10 text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-medium text-[#6B7280] mb-2">No requests found</h3>
                <p className="text-sm text-[#9CA3AF]">
                  {search || typeFilter !== "All" || statusFilter !== "All" 
                    ? "Try adjusting your filters or search terms" 
                    : "No officer requests have been submitted yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((r) => (
                  <div key={r._id} className="p-6 rounded-xl border border-[#E5E7EB] bg-gradient-to-r from-[#FAFBFC] to-[#F8FAFC] hover:shadow-md transition-all duration-200">
                    {/* Request Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#0B214A]" />
                            <span className="font-semibold text-[#0B214A]">{r.officerId?.name || "Unknown Officer"}</span>
                          </div>
                          <span className="text-xs text-[#6B7280]">•</span>
                          <span className="text-sm text-[#6B7280]">{r.type}</span>
                          <span className="text-xs text-[#6B7280]">•</span>
                          <span className="text-xs text-[#6B7280] flex items-center gap-1">
                            <Clock4 className="w-3 h-3" />
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-[#374151] mb-2">{r.subject}</h4>
                        <p className="text-sm text-[#6B7280] leading-relaxed">{r.description}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                        r.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                        r.status === 'Denied' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {r.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                        {r.status === 'Denied' && <X className="w-4 h-4" />}
                        {r.status === 'Pending' && <Clock4 className="w-4 h-4" />}
                        {r.status}
                      </span>
                    </div>

                    {/* Appointment Date */}
                    {r.type === "Request Appointment" && r.appointmentDate && (
                      <div className="flex items-center gap-2 text-sm text-[#0B214A] mb-4 p-3 bg-blue-50 rounded-lg">
                        <CalendarDays className="w-4 h-4" />
                        <span className="font-medium">Scheduled:</span>
                        <span>{new Date(r.appointmentDate).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Leave Dates Display */}
                    {r.type === "Leave Request" && (r.leaveStartDate || r.leaveEndDate) && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-[#0B214A] mb-2">
                          <CalendarDays className="w-4 h-4" />
                          <span className="font-medium">Leave Period:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {r.leaveStartDate && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#6B7280]">From:</span>
                              <span className="font-medium">{new Date(r.leaveStartDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {r.leaveEndDate && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#6B7280]">To:</span>
                              <span className="font-medium">{new Date(r.leaveEndDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {r.leaveStartDate && r.leaveEndDate && (
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <div className="flex items-center gap-2 text-xs text-green-700">
                              <Clock className="w-3 h-3" />
                              <span>
                                Duration: {Math.ceil((new Date(r.leaveEndDate) - new Date(r.leaveStartDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Replies */}
                    {Array.isArray(r.replies) && r.replies.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <div className="text-sm font-medium text-[#6B7280] flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Admin Replies ({r.replies.length})
                        </div>
                        {r.replies.slice(-2).map((rep, idx) => (
                          <div key={idx} className="text-sm bg-[#F7FAFF] border border-[#E4E9F2] rounded-lg px-4 py-3">
                            <div className="flex items-start gap-3">
                              <User className="w-4 h-4 text-[#0B214A] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-[#374151]">{rep.message}</p>
                                <span className="text-xs text-[#9CA3AF] mt-1 block">
                                  {new Date(rep.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {r.replies.length > 2 && (
                          <div className="text-xs text-[#0B214A] font-medium">
                            +{r.replies.length - 2} more replies
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E5E7EB]">
                      {/* Status Actions */}
                      <div className="flex flex-wrap gap-2">
                        {r.type === "Request Appointment" ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#0B214A]" />
                              <div className="flex flex-col">
                                <input
                                  type="datetime-local"
                                  className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                                    appointmentErrors[r._id]
                                      ? 'border-red-400 focus:ring-red-300'
                                      : 'border-[#D6DEEB] focus:ring-[#0B214A]'
                                  }`}
                                  value={appointmentInputs[r._id] || ""}
                                  onChange={(e) => handleAppointmentChange(r._id, e.target.value)}
                                  min={getCurrentDateTime()}
                                />
                                {appointmentErrors[r._id] && (
                                  <p className="text-red-600 text-xs mt-1">{appointmentErrors[r._id]}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                updateStatus(
                                  r._id,
                                  "Approved",
                                  appointmentInputs[r._id]
                                )
                              }
                              disabled={
                                updatingId === r._id ||
                                !appointmentInputs[r._id]
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {updatingId === r._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => updateStatus(r._id, "Approved")}
                            disabled={updatingId === r._id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {updatingId === r._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(r._id, "Denied")}
                          disabled={updatingId === r._id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {updatingId === r._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Deny
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(r._id)}
                          disabled={updatingId === r._id || deletingId === r._id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>

                      {/* Reply Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 border border-[#D6DEEB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B214A] focus:border-transparent placeholder-[#9CA3AF]"
                            placeholder="Write a reply to the officer..."
                            value={replyingId === r._id ? replyText : ""}
                            onChange={(e) => {
                              setReplyingId(r._id);
                              setReplyText(e.target.value);
                            }}
                          />
                          <button
                            onClick={() => submitReply(r._id)}
                            disabled={
                              replyingId === r._id && !replyText.trim()
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white text-sm font-medium hover:bg-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {replyingId === r._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Send
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Delete Confirmation */}
                    {showDeleteConfirm === r._id && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-800 mb-1">Delete Request</h4>
                            <p className="text-xs text-red-700">This action cannot be undone</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-xs text-red-700 mb-2">
                            Are you sure you want to delete this request?
                          </p>
                          <div className="bg-white border border-red-200 rounded p-2">
                            <div className="text-xs font-medium text-[#0B214A]">{r.subject}</div>
                            <div className="text-xs text-[#6B7280] mt-1">
                              From: {r.officerId?.name || 'Unknown Officer'} • {r.type}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            disabled={deletingId === r._id}
                            className="px-3 py-1 rounded text-xs font-medium border border-red-300 text-red-700 hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteRequest(r._id)}
                            disabled={deletingId === r._id}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {deletingId === r._id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                Delete Request
                              </>
                            )}
                          </button>
                        </div>
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

export default ViewRequests;
