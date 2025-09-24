import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function UpdateComplaint() {
  const { id } = useParams(); // case id from URL
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const location = useLocation();
  const [hasAuth, setHasAuth] = useState(false);

  // Load existing complaint
  useEffect(() => {
    // check for token in storage so we can provide a helpful UI if unauthenticated
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setHasAuth(!!token);

    const fetchComplaint = async () => {
      // If the report was passed via navigation state (from ReportSuccess), use it
      const passed = location.state?.report;
      if (passed) {
        console.log('INFO: using passed report from location.state to avoid protected GET');
        setForm(passed);
        setLoading(false);
        return;
      }
      try {
        console.log('DEBUG: axios baseURL', axiosInstance.defaults.baseURL);
        console.log('DEBUG: GET URL', `${axiosInstance.defaults.baseURL.replace(/\/+$/, '')}/cases/${id}`);
        const res = await axiosInstance.get(`/cases/${id}`);
        setForm(res.data?.data || res.data);
      } catch (err) {
        console.error('fetchComplaint error', err);
        const status = err?.response?.status;
        const body = err?.response?.data;
        setBanner({
          type: "error",
          message:
            body?.message || (body ? JSON.stringify(body) : err.message) || "Failed to load complaint",
          status,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  // determine if a one-time edit token was passed (creator flow)
  const passedEditToken = location.state?.editToken || location.state?.report?.editToken || null;
  const canEditWithoutAuth = !!passedEditToken;
  const canEdit = hasAuth || canEditWithoutAuth;

  const onChange = (path, value) => {
    const keys = path.split(".");
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    // re-check token just before submit (helpful for debugging race conditions)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('DEBUG: submit token present?', !!token, token ? token.slice(0,10) + '...' : null);
    if (!token) {
      setBanner({ type: 'error', message: 'You must be signed in to update this complaint.' });
      return;
    }
    try {
      console.log('DEBUG: axios baseURL', axiosInstance.defaults.baseURL);
      console.log('DEBUG: PUT URL', `${axiosInstance.defaults.baseURL.replace(/\/+$/, '')}/cases/${id}`);
      // If user not authenticated, but we were given an editToken via navigation state, include it in the header
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {};
      if (!token) {
        const passedToken = location.state?.editToken || location.state?.report?.editToken || form.editToken || null;
        if (passedToken) headers['X-Edit-Token'] = passedToken;
      }
      const res = await axiosInstance.put(`/cases/${id}`, form, { headers });
      const updated = res?.data?.data || res?.data;
      if (res?.data?.success) {
        navigate(`/cases/${id}`); // back to details page
      }
    } catch (err) {
      console.error('updateCase error', err);
      const status = err?.response?.status;
      const body = err?.response?.data;
      setBanner({
        type: "error",
        message: body?.message || (body ? JSON.stringify(body) : err.message) || "Failed to update complaint",
        status,
      });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!form) return <div className="p-6">Complaint not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Update Complaint</h1>

      {banner && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {banner.message}
        </div>
      )}
      {!hasAuth && canEditWithoutAuth && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
          You are editing as the report creator using a one-time edit token. Your changes will be accepted once; you do not need to sign in now.
        </div>
      )}

      {!hasAuth && !canEditWithoutAuth && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-amber-50 text-amber-800 border border-amber-200">
          You are not signed in. To save changes you must <button onClick={() => navigate('/login')} className="underline font-medium">log in</button>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={form.complainant?.name || ""}
          onChange={(e) => onChange("complainant.name", e.target.value)}
          placeholder="Full Name"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          value={form.complainant?.phone || ""}
          onChange={(e) => onChange("complainant.phone", e.target.value)}
          placeholder="Phone"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          value={form.complainant?.email || ""}
          onChange={(e) => onChange("complainant.email", e.target.value)}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          value={form.complaintDetails?.location || ""}
          onChange={(e) => onChange("complaintDetails.location", e.target.value)}
          placeholder="Location"
          className="w-full border px-3 py-2 rounded"
        />
        <select
          value={form.idInfo?.type || ""}
          onChange={(e) => onChange("idInfo.type", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select ID Type</option>
          <option value="NATIONAL_ID">National ID</option>
          <option value="PASSPORT">Passport</option>
          <option value="DRIVER_LICENSE">Driver License</option>
        </select>
        <input
          value={form.idInfo?.value || ""}
          onChange={(e) => onChange("idInfo.value", e.target.value)}
          placeholder="ID Number"
          className="w-full border px-3 py-2 rounded"
        />
        <h1>Complaint Details</h1>
        <select
          value={form.complaintDetails?.typeOfComplaint || ""}
          onChange={(e) => onChange("complaintDetails.typeOfComplaint", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Type of Complaint</option>
          <option value="THEFT">Theft</option>
          <option value="ASSAULT">Assault</option>
          <option value="VANDALISM">Vandalism</option>
        </select>
        <select
          value={form.priority || "MEDIUM"}
          onChange={(e) => onChange("priority", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <input
          type="date"
          value={form.complaintDetails?.incidentDate ? form.complaintDetails.incidentDate.split('T')[0] : ""}
          onChange={(e) => onChange("complaintDetails.incidentDate", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          value={form.complaintDetails?.location || ""}
          onChange={(e) => onChange("complaintDetails.location", e.target.value)}
          placeholder="Location"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          value={form.estimatedLoss || ""}
          onChange={(e) => onChange("estimatedLoss", e.target.value)}
          placeholder="Estimated Loss"
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          value={form.complaintDetails?.description || ""}
          onChange={(e) =>
            onChange("complaintDetails.description", e.target.value)
          }
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />

        <h1>Additional Information</h1>
        <h2>Witness Information</h2>
        <input
            value={(form.additionalInfo?.witnesses?.[0]?.name) || ""}
            onChange={(e) => onChange("additionalInfo.witnesses.0.name", e.target.value)}
            placeholder="Witness Name"
            className="w-full border px-3 py-2 rounded"
        />
        <input
            value={(form.additionalInfo?.witnesses?.[0]?.phone) || ""}
            onChange={(e) => onChange("additionalInfo.witnesses.0.phone", e.target.value)}
            placeholder="Witness Phone"
            className="w-full border px-3 py-2 rounded"
        />
        <input
            value={(form.additionalInfo?.witnesses?.[0]?.id) || ""}
            onChange={(e) => onChange("additionalInfo.witnesses.0.id", e.target.value)}
            placeholder="Witness ID"
            className="w-full border px-3 py-2 rounded"
        />

        <h2>Suspect Information</h2>
        <input
            value={(form.additionalInfo?.suspects?.[0]?.name) || ""}
            onChange={(e) => onChange("additionalInfo.suspects.0.name", e.target.value)}
            placeholder="Suspect Name"
            className="w-full border px-3 py-2 rounded"
        />
        <input
            value={(form.additionalInfo?.suspects?.[0]?.appearance) || ""}
            onChange={(e) => onChange("additionalInfo.suspects.0.appearance", e.target.value)}
            placeholder="Suspect Appearance"
            className="w-full border px-3 py-2 rounded"
        />
        <input
            value={(form.additionalInfo?.suspects?.[0]?.photos?.[0]) || ""}
            onChange={(e) => onChange("additionalInfo.suspects.0.photos.0", e.target.value)}
            placeholder="Suspect Photo URL"
            className="w-full border px-3 py-2 rounded"
        />

        <h2>Evidence</h2>
        <input
            value={(form.additionalInfo?.evidence?.[0]?.photos?.[0]) || ""}
            onChange={(e) => onChange("additionalInfo.evidence.0.photos.0", e.target.value)}
            placeholder="Evidence Photo URL"
            className="w-full border px-3 py-2 rounded"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!canEdit}
            className={`px-4 py-2 rounded font-medium ${canEdit ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
