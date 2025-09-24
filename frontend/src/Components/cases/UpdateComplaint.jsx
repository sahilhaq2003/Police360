import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import PoliceHeader from '../PoliceHeader/PoliceHeader';

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
    // re-check auth token just before submit
    const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('DEBUG: submit token present?', !!authToken, authToken ? authToken.slice(0,10) + '...' : null);

    // If there's no auth token and no one-time edit token, block the request
    if (!authToken && !canEditWithoutAuth) {
      setBanner({ type: 'error', message: 'You must be signed in to update this complaint.' });
      return;
    }

    try {
      console.log('DEBUG: axios baseURL', axiosInstance.defaults.baseURL);
      console.log('DEBUG: PUT URL', `${axiosInstance.defaults.baseURL.replace(/\/+$/, '')}/cases/${id}`);

      const headers = {};
      // If unauthenticated but we have a one-time edit token, include it
      if (!authToken && canEditWithoutAuth) {
        const passedToken = passedEditToken || form.editToken || null;
        if (passedToken) headers['X-Edit-Token'] = passedToken;
      }

      const res = await axiosInstance.put(`/cases/${id}`, form, { headers });
      const updated = res?.data?.data || res?.data;
      if (res?.data?.success) {
        navigate(`/cases/${id}`); // back to details page
      } else {
        setBanner({ type: 'success', message: 'Update completed' });
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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      {/* header spans full width */}
      <PoliceHeader />

      <div className="max-w-3xl md:max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-6 sm:px-8 sm:py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Update Complaint</h1>
              <p className="mt-1 text-sm text-slate-500">Edit complaint details. Changes will be saved to the case record.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">← Back</button>
            </div>
          </div>

          {/* banners */}
          <div className="mt-4">
            {banner && (
              <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${banner.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
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
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-slate-700">Full name</div>
                <input value={form.complainant?.name || ''} onChange={(e) => onChange('complainant.name', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-slate-700">Phone</div>
                <input value={form.complainant?.phone || ''} onChange={(e) => onChange('complainant.phone', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-slate-700">Email</div>
                <input value={form.complainant?.email || ''} onChange={(e) => onChange('complainant.email', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-slate-700">Location</div>
                <input value={form.complaintDetails?.location || ''} onChange={(e) => onChange('complaintDetails.location', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-slate-700">ID Type</div>
                <select value={form.idInfo?.type || ''} onChange={(e) => onChange('idInfo.type', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select ID Type</option>
                  <option value="NATIONAL_ID">National ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVER_LICENSE">Driver License</option>
                </select>
              </label>

              <label className="block">
                <div className="text-sm font-medium text-slate-700">ID Number</div>
                <input value={form.idInfo?.value || ''} onChange={(e) => onChange('idInfo.value', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-slate-700">Priority</div>
                <select value={form.priority || 'MEDIUM'} onChange={(e) => onChange('priority', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-slate-700">Type of Complaint</div>
                <select value={form.complaintDetails?.typeOfComplaint || ''} onChange={(e) => onChange('complaintDetails.typeOfComplaint', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Type of Complaint</option>
                  <option value="THEFT">Theft</option>
                  <option value="ASSAULT">Assault</option>
                  <option value="VANDALISM">Vandalism</option>
                </select>
              </label>

              <label className="block">
                <div className="text-sm font-medium text-slate-700">Incident Date</div>
                <input type="date" value={form.complaintDetails?.incidentDate ? form.complaintDetails.incidentDate.split('T')[0] : ''} onChange={(e) => onChange('complaintDetails.incidentDate', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium text-slate-700">Estimated Loss</div>
              <input value={form.estimatedLoss || ''} onChange={(e) => onChange('estimatedLoss', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-slate-700">Description</div>
              <textarea value={form.complaintDetails?.description || ''} onChange={(e) => onChange('complaintDetails.description', e.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 h-28 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Witness (optional)</h3>
                <input value={(form.additionalInfo?.witnesses?.[0]?.name) || ''} onChange={(e) => onChange('additionalInfo.witnesses.0.name', e.target.value)} placeholder="Name" className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={(form.additionalInfo?.witnesses?.[0]?.phone) || ''} onChange={(e) => onChange('additionalInfo.witnesses.0.phone', e.target.value)} placeholder="Phone" className="mt-3 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={(form.additionalInfo?.witnesses?.[0]?.id) || ''} onChange={(e) => onChange('additionalInfo.witnesses.0.id', e.target.value)} placeholder="ID (optional)" className="mt-3 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Suspect / Evidence (optional)</h3>
                <input value={(form.additionalInfo?.suspects?.[0]?.name) || ''} onChange={(e) => onChange('additionalInfo.suspects.0.name', e.target.value)} placeholder="Suspect Name" className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={(form.additionalInfo?.suspects?.[0]?.appearance) || ''} onChange={(e) => onChange('additionalInfo.suspects.0.appearance', e.target.value)} placeholder="Appearance" className="mt-3 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input value={(form.additionalInfo?.evidence?.[0]) || ''} onChange={(e) => onChange('additionalInfo.evidence.0', e.target.value)} placeholder="Evidence (URL or note)" className="mt-3 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={!canEdit} className={`px-4 py-2 rounded-md text-sm font-medium ${canEdit ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}
