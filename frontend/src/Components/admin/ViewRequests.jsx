import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { CheckCircle, XCircle, Send, ArrowLeft } from "lucide-react";

const ViewRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [appointmentInputs, setAppointmentInputs] = useState({});
  const [typeFilter, setTypeFilter] = useState("Request Appointment");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/requests");
      setRequests(res.data?.data || []);
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
    try {
      const body = appointmentDate ? { status, appointmentDate } : { status };
      const res = await axiosInstance.put(`/requests/${id}`, body);
      const updated = res.data?.data || { _id: id, status };
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...updated } : r))
      );
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

  const normalized = (s) => (s || "").toString().toLowerCase();
  const filtered = requests.filter((r) => {
    if (r.type !== typeFilter) return false;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Officer Requests
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {["Request Appointment", "Report Issue"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                typeFilter === type
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {type === "Request Appointment" ? "Appointments" : "Issues"}
            </button>
          ))}
          <div className="ml-auto">
            <input
              className="w-72 border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Search officer, subject, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase sticky top-0 z-10">
                <tr>
                  {[
                    "Officer",
                    "Type",
                    "Subject",
                    "Description",
                    "Status",
                    "Appt. Date",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-2 py-6 text-center text-slate-500"
                      colSpan={8}
                    >
                      Loading requests...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      className="px-2 py-6 text-center text-slate-500"
                      colSpan={8}
                    >
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr
                      key={r._id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } hover:bg-slate-100/60 transition`}
                    >
                      <td className="px-2 py-2 whitespace-nowrap">
                        {r.officerId?.name || "—"}
                      </td>
                      <td className="px-2 py-2">{r.type}</td>
                      <td className="px-2 py-2">{r.subject}</td>

                      {/* Description + replies */}
                      <td className="px-2 py-2 break-words">
                        <p className="mb-1">{r.description}</p>
                        {Array.isArray(r.replies) && r.replies.length > 0 && (
                          <div className="space-y-1">
                            {r.replies.slice(-3).map((rep, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 break-words"
                              >
                                <span className="font-semibold">Admin:</span>{" "}
                                {rep.message}
                                <span className="ml-2 text-[10px] text-slate-500">
                                  {new Date(rep.createdAt).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border ${
                            r.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : r.status === "Denied"
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Appointment Date */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {r.type === "Request Appointment" && r.appointmentDate
                          ? new Date(r.appointmentDate).toLocaleString()
                          : "—"}
                      </td>

                      {/* Created */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-2">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {r.type === "Request Appointment" ? (
                              <>
                                <input
                                  type="datetime-local"
                                  className="border border-slate-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                  value={appointmentInputs[r._id] || ""}
                                  onChange={(e) =>
                                    setAppointmentInputs((prev) => ({
                                      ...prev,
                                      [r._id]: e.target.value,
                                    }))
                                  }
                                />
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
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => updateStatus(r._id, "Approved")}
                                disabled={updatingId === r._id}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => updateStatus(r._id, "Denied")}
                              disabled={updatingId === r._id}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-60"
                            >
                              <XCircle className="w-4 h-4" />
                              Deny
                            </button>
                          </div>

                          {/* Reply box */}
                          <div className="flex items-center gap-2">
                            <input
                              className="flex-1 border border-slate-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                              placeholder="Write a reply…"
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
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-60"
                            >
                              <Send className="w-4 h-4" />
                              Send
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRequests;
