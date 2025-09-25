import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../utils/axiosInstance";

export default function ComplaintProgress() {
  const navigate = useNavigate();
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [assignOfficerId, setAssignOfficerId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) {
      setError("Please enter a complaint ID.");
      return;
    }
    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const res = await axiosInstance.get(`/cases/${complaintId}`);
      setComplaint(res.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Complaint not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignOfficerId.trim() || !complaint) return;
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post(`/cases/${complaint._id}/assign`, { officerId: assignOfficerId });
      setComplaint(res.data?.data || complaint);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to assign officer.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !complaint) return;
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post(`/cases/${complaint._id}/notes`, { note: noteText });
      setComplaint(res.data?.data || complaint);
      setNoteText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Track Complaint Progress</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-700 transition px-3 py-1 border rounded"
          >
            ← Back
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            placeholder="Enter Complaint ID"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Complaint Details */}
        {complaint && (
          <div className="space-y-3">
            <div>
              <span className="font-medium text-slate-700">Type:</span>{" "}
              {complaint.complaintDetails?.typeOfComplaint}
            </div>
            <div>
              <span className="font-medium text-slate-700">Status:</span>{" "}
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {complaint.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Location:</span>{" "}
              {complaint.complaintDetails?.location}
            </div>
            <div>
              <span className="font-medium text-slate-700">Description:</span>{" "}
              {complaint.complaintDetails?.description}
            </div>
            <div>
              <span className="font-medium text-slate-700">Assigned Officer:</span>{" "}
              {complaint.assignedOfficer?.name || "Not assigned yet"}
            </div>
            <div>
              <span className="font-medium text-slate-700">Created:</span>{" "}
              {new Date(complaint.createdAt).toLocaleString()}
            </div>
            {/* Assign Officer
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-slate-700 mb-2">Assign Officer</h4>
              <div className="flex gap-2">
                <input
                  value={assignOfficerId}
                  onChange={(e) => setAssignOfficerId(e.target.value)}
                  placeholder="Officer ID"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button onClick={handleAssign} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Assign</button>
              </div>
            </div> */}

            {/* Add Note
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-slate-700 mb-2">Add Investigation Note</h4>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} className="w-full border px-3 py-2 rounded mb-2" placeholder="Enter a note" />
              <div className="flex gap-2">
                <button onClick={handleAddNote} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Add Note</button>
              </div>
            </div> */}

            {/* Notes list */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-slate-700 mb-2">Investigation Notes</h4>
              {(complaint.investigationNotes || []).length === 0 && <div className="text-sm text-slate-500">No notes yet.</div>}
              {(complaint.investigationNotes || []).map((n, idx) => (
                <div key={idx} className="mb-2 p-3 bg-slate-50 border rounded">
                  <div className="text-sm text-slate-700">{n.note}</div>
                  <div className="text-xs text-slate-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''} {n.author?.name ? ` — ${n.author.name}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
