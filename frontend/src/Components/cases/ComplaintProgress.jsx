import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axiosInstance from "../../utils/axiosInstance";
import Nav from "../Nav/Nav";
import hero from '../../assets/loginbg.jpg';
import Footer from "../Footer/Footer";

export default function ComplaintProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const initialId = location.state?.reportNumber || params.id || "";
  const [complaintId, setComplaintId] = useState(initialId);
  const [complaint, setComplaint] = useState(null);
  const [assignOfficerId, setAssignOfficerId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (eOrId) => {
    // allow calling with an event (form submit) or with an id string
    let idToSearch = '';
    if (typeof eOrId === 'string') idToSearch = eOrId;
    else if (eOrId && eOrId.preventDefault) {
      eOrId.preventDefault();
      idToSearch = complaintId;
    } else {
      idToSearch = complaintId;
    }

    if (!idToSearch.trim()) {
      setError("Please enter a complaint ID.");
      return;
    }
    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const res = await axiosInstance.get(`/cases/${idToSearch}`);
      setComplaint(res.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Complaint not found.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run search on mount if initialId was provided (via route param or navigation state)
  useEffect(() => {
    if (initialId && initialId.trim()) {
      // run search with provided id
      handleSearch(initialId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero})` }}
        aria-hidden
      />
      {/* Overlay to improve contrast */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div className="relative z-10 py-12 px-4">
        <Nav /><br /><br /><br />
        <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border border-slate-200 p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Track Complaint Progress</h1>
            <p className="text-sm text-slate-500">Enter your complaint ID to view current status and investigation notes.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-700 hover:text-slate-900 transition px-4 py-2 rounded-md border bg-white/80 shadow-sm"
          >
            ← Back
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            placeholder="Enter Complaint ID"
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0B214A] outline-none bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#0B214A] text-white px-6 py-3 rounded-lg hover:bg-[#0B114C] disabled:opacity-50 shadow"
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
          <div className="space-y-4">
            <div>
              <span className="font-medium text-slate-700">Type:</span>{" "}
              {complaint.complaintDetails?.typeOfComplaint}
            </div>
            <div>
              <span className="font-medium text-slate-700">Status:</span>{" "}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
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
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium text-slate-700 mb-3">Investigation Notes</h4>
              {(complaint.investigationNotes || []).length === 0 && <div className="text-sm text-slate-500">No notes yet.</div>}
              {(complaint.investigationNotes || []).map((n, idx) => (
                <div key={idx} className="mb-3 p-4 bg-slate-50 border rounded-lg">
                  <div className="text-sm text-slate-700">{n.note}</div>
                  <div className="text-xs text-slate-500 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''} {n.author?.name ? ` — ${n.author.name}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  );
}
