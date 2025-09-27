import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import {
  CalendarDays,
  MapPin,
  Clock,
  ClipboardList,
  ArrowLeft,
  CheckCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";

const OfficerCalendar = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineInput, setShowDeclineInput] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id =
          localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (!id) return navigate("/login");
        const res = await axiosInstance.get("/schedules", {
          params: { officer: id, page: 1, pageSize: 200 },
        });
        setItems(res.data?.data || []);
      } catch (e) {
        console.error("Error loading schedules:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const updateScheduleRemark = async (scheduleId, remark, reason = '') => {
    try {
      const payload = { remark };
      if (remark === 'declined' && reason) {
        payload.declineReason = reason;
      }
      
      await axiosInstance.put(`/schedules/${scheduleId}/remark`, payload);
      // Update the local state
      setItems(prev => prev.map(item => 
        item._id === scheduleId ? { ...item, remark, declineReason: reason || item.declineReason } : item
      ));
      
      // Reset decline input
      setShowDeclineInput(null);
      setDeclineReason('');
    } catch (error) {
      console.error("Error updating schedule remark:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FB] via-[#E9EEF5] to-[#F4F7FB] text-[#0B214A]">
      <PoliceHeader />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B214A]">
              Duty Schedule
            </h1>
            <p className="text-sm text-[#5A6B85]">
              View your assigned shifts and duty notes
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white hover:bg-[#123974] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Schedule List */}
        <div className="p-6 rounded-2xl bg-white shadow-lg border border-[#E0E6F0]">
          {loading ? (
            <p className="text-sm text-[#5A6B85] animate-pulse">
              Loading duty schedule…
            </p>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="w-10 h-10 mx-auto text-[#9AA7C2]" />
              <p className="mt-3 text-sm text-[#5A6B85]">
                No schedules assigned yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it._id}
                  className="px-5 py-4 rounded-xl border border-[#E5E9F2] bg-gradient-to-r from-[#F9FBFF] to-[#F2F6FB] hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    {/* Date & Shift */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                      <CalendarDays className="w-4 h-4 text-[#1D4ED8]" />
                      {it.date
                        ? new Date(it.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4 text-[#059669]" />
                      {it.shift}
                    </div>

                    {/* Location & Status */}
                    <div className="mt-2 md:mt-0 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs text-[#374151]">
                        <MapPin className="w-4 h-4 text-[#DC2626]" />
                        {it.location || "Location not specified"}
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        it.remark === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : it.remark === 'accepted' 
                          ? 'bg-blue-100 text-blue-800' 
                          : it.remark === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : it.remark === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {it.remark || 'pending'}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {it.notes && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-[#4B5563]">
                      <ClipboardList className="w-4 h-4 text-[#F59E0B]" />
                      <span>{it.notes}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    {it.remark === 'pending' && (
                      <>
                        <button
                          onClick={() => updateScheduleRemark(it._id, 'accepted')}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                        >
                          <PlayCircle className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          onClick={() => setShowDeclineInput(it._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition"
                        >
                          <XCircle className="w-3 h-3" />
                          Decline
                        </button>
                      </>
                    )}
                    {it.remark === 'accepted' && (
                      <button
                        onClick={() => updateScheduleRemark(it._id, 'completed')}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </button>
                    )}
                    {it.remark === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                    {it.remark === 'declined' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 text-xs rounded-md">
                        <XCircle className="w-3 h-3" />
                        Declined
                      </span>
                    )}
                  </div>

                  {/* Decline Reason Input */}
                  {showDeclineInput === it._id && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <label className="block text-sm font-medium text-red-800 mb-2">
                        Reason for declining:
                      </label>
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Please provide a reason for declining this schedule..."
                        className="w-full px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={3}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => updateScheduleRemark(it._id, 'declined', declineReason)}
                          disabled={!declineReason.trim()}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Submit Decline
                        </button>
                        <button
                          onClick={() => {
                            setShowDeclineInput(null);
                            setDeclineReason('');
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Decline Reason Display */}
                  {it.remark === 'declined' && it.declineReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-sm font-medium text-red-800 mb-1">Decline Reason:</div>
                      <div className="text-sm text-red-700">{it.declineReason}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerCalendar;
