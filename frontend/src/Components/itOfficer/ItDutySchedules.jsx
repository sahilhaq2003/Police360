import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import {
  User,
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  Trash2,
  ArrowLeft,
  ClipboardList,
  RotateCcw,
} from "lucide-react";

const ItDutySchedules = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    officer: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [reassignForm, setReassignForm] = useState({
    officer: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [showReassignForm, setShowReassignForm] = useState(null);
  const [reassignReason, setReassignReason] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [o, s] = await Promise.all([
          axiosInstance.get("/officers", {
            params: {
              page: 1,
              pageSize: 100,
              role: "All",
              status: "All",
              station: "All",
            },
          }),
          axiosInstance.get("/schedules", {
            params: { page: 1, pageSize: 200 },
          }),
        ]);
        const list = Array.isArray(o.data?.data) ? o.data.data : [];
        setOfficers(list.filter((x) => x.role === "Officer"));
        setItems(s.data?.data || []);
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.officer || !form.date || !form.startTime || !form.endTime) return;
    const payload = {
      officer: form.officer,
      date: form.date,
      shift: `${form.startTime}-${form.endTime}`,
      location: form.location,
      notes: form.notes,
    };
    await axiosInstance.post("/schedules", payload);
    const res = await axiosInstance.get("/schedules", {
      params: { page: 1, pageSize: 200 },
    });
    setItems(res.data?.data || []);
    setForm({
      officer: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
    });
  };

  const remove = async (id) => {
    await axiosInstance.delete(`/schedules/${id}`);
    setItems((prev) => prev.filter((x) => x._id !== id));
  };

  const reassign = async (id) => {
    if (!reassignForm.officer || !reassignForm.date || !reassignForm.startTime || !reassignForm.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    const payload = {
      officer: reassignForm.officer,
      date: reassignForm.date,
      shift: `${reassignForm.startTime}-${reassignForm.endTime}`,
      location: reassignForm.location,
      notes: reassignForm.notes,
    };
    
    await axiosInstance.put(`/schedules/${id}/reassign`, payload);
    
    // Refresh the schedules list
    const res = await axiosInstance.get("/schedules", {
      params: { page: 1, pageSize: 200 },
    });
    setItems(res.data?.data || []);
    
    // Reset form and close
    setReassignForm({
      officer: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
    });
    setShowReassignForm(null);
    setReassignReason('');
  };

  const openReassignForm = (schedule) => {
    // Pre-fill the form with current schedule data
    const startTime = schedule.shift ? schedule.shift.split('-')[0] : '';
    const endTime = schedule.shift ? schedule.shift.split('-')[1] : '';
    
    setReassignForm({
      officer: schedule.officer?._id || schedule.officer || "",
      date: schedule.date ? new Date(schedule.date).toISOString().split('T')[0] : "",
      startTime: startTime,
      endTime: endTime,
      location: schedule.location || "",
      notes: schedule.notes || "",
    });
    setShowReassignForm(schedule._id);
    setReassignReason('');
  };

  const officerMap = useMemo(
    () => Object.fromEntries(officers.map((o) => [o._id, o])),
    [officers]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F7FB] via-[#E9EEF5] to-[#F4F7FB] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Duty Schedules</h1>
            <p className="text-sm text-[#5A6B85]">
              Assign shifts and manage upcoming officer schedules
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white hover:bg-[#123974] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={save}
          className="p-6 rounded-2xl bg-white shadow-md border border-[#E5E9F2] mb-10"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#0B214A]" />
            Create New Duty Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.officer}
              onChange={(e) =>
                setForm((v) => ({ ...v, officer: e.target.value }))
              }
              required
            >
              <option value="">Select Officer</option>
              {officers.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.date}
              onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))}
              required
            />
            <input
              type="time"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.startTime}
              onChange={(e) =>
                setForm((v) => ({ ...v, startTime: e.target.value }))
              }
              required
            />
            <input
              type="time"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.endTime}
              onChange={(e) =>
                setForm((v) => ({ ...v, endTime: e.target.value }))
              }
              required
            />
            <input
              type="text"
              placeholder="Location"
              className="border border-[#E5E9F2] rounded-md px-3 py-2 text-sm"
              value={form.location}
              onChange={(e) =>
                setForm((v) => ({ ...v, location: e.target.value }))
              }
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-[#0B214A] text-white hover:bg-[#123974] transition text-sm"
            >
              Save
            </button>
            <textarea
              placeholder="Notes (optional)"
              className="md:col-span-6 border border-[#E5E9F2] rounded-md px-3 py-2 text-sm mt-2"
              value={form.notes}
              onChange={(e) =>
                setForm((v) => ({ ...v, notes: e.target.value }))
              }
            />
          </div>
        </form>

        {/* Table */}
        <div className="p-6 rounded-2xl bg-white shadow-md border border-[#E5E9F2]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#0B214A]" />
            Upcoming Schedules
          </h2>
          {loading ? (
            <p className="text-sm text-[#5A6B85] animate-pulse">
              Loading schedules…
            </p>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 mx-auto text-[#9AA7C2]" />
              <p className="mt-3 text-sm text-[#5A6B85]">
                No schedules have been assigned yet.
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
                    {/* Schedule Details */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0B214A]">
                        <User className="w-4 h-4 text-[#1D4ED8]" />
                        {officerMap[it.officer?._id || it.officer]?.name ||
                          it.officer?.name ||
                          "—"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#374151]">
                        <CalendarDays className="w-4 h-4 text-[#059669]" />
                        {it.date
                          ? new Date(it.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#374151]">
                        <Clock className="w-4 h-4 text-[#059669]" />
                        {it.shift}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#374151]">
                        <MapPin className="w-4 h-4 text-[#DC2626]" />
                        {it.location || "Location not specified"}
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="mt-2 md:mt-0 flex items-center gap-4">
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

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {it.remark === 'declined' && (
                          <button
                            onClick={() => openReassignForm(it)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Re-assign
                          </button>
                        )}
                        <button
                          onClick={() => remove(it._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {it.notes && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-[#4B5563]">
                      <ClipboardList className="w-4 h-4 text-[#F59E0B]" />
                      <span>{it.notes}</span>
                    </div>
                  )}

                  {/* Decline Reason Display */}
                  {it.remark === 'declined' && it.declineReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-sm font-medium text-red-800 mb-1">Decline Reason:</div>
                      <div className="text-sm text-red-700">{it.declineReason}</div>
                    </div>
                  )}

                  {/* Re-assign Form */}
                  {showReassignForm === it._id && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm font-medium text-blue-800 mb-3">Re-assign Schedule:</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Officer *
                          </label>
                          <select
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.officer}
                            onChange={(e) => setReassignForm((v) => ({ ...v, officer: e.target.value }))}
                            required
                          >
                            <option value="">Select Officer</option>
                            {officers.map((o) => (
                              <option key={o._id} value={o._id}>
                                {o.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Date *
                          </label>
                          <input
                            type="date"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.date}
                            onChange={(e) => setReassignForm((v) => ({ ...v, date: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.startTime}
                            onChange={(e) => setReassignForm((v) => ({ ...v, startTime: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            End Time *
                          </label>
                          <input
                            type="time"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.endTime}
                            onChange={(e) => setReassignForm((v) => ({ ...v, endTime: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            placeholder="Location"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.location}
                            onChange={(e) => setReassignForm((v) => ({ ...v, location: e.target.value }))}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-blue-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            placeholder="Notes (optional)"
                            className="w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={reassignForm.notes}
                            onChange={(e) => setReassignForm((v) => ({ ...v, notes: e.target.value }))}
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => reassign(it._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                        >
                          Submit Re-assignment
                        </button>
                        <button
                          onClick={() => {
                            setShowReassignForm(null);
                            setReassignReason('');
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition"
                        >
                          Cancel
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
  );
};

export default ItDutySchedules;
