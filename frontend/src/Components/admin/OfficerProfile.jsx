import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { ArrowLeft, Pencil, Save, X, Loader2, ImagePlus } from 'lucide-react';

function normalizeForForm(data) {
  return {
    name: data.name || '',
    officerId: data.officerId || '',
    email: data.email || '',
    contactNumber: data.contactNumber || '',
    station: data.station || '',
    username: data.username || '',
    role: data.role || 'Officer',
    isActive: !!data.isActive,
    photo: data.photo || '',
  };
}
function pick(obj, keys) { const out = {}; keys.forEach((k) => (out[k] = obj[k])); return out; }
function compressImage(file, maxW = 640, maxH = 640, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(maxW / width, maxH / height, 1);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = url;
  });
}

const OfficerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [officer, setOfficer] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialRef = useRef(null);

  const role = useMemo(() => (localStorage.getItem('role') || sessionStorage.getItem('role') || '').toLowerCase(), []);
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchOfficer = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(`/officers/${id}`);
        setOfficer(res.data);
        const payload = normalizeForForm(res.data);
        setFormData(payload);
        initialRef.current = payload;
      } catch (err) {
        const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to load officer.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficer();
  }, [id]);

  const isDirty = useMemo(() => {
    if (!formData || !initialRef.current) return false;
    const keys = Object.keys(initialRef.current);
    return JSON.stringify(pick(formData, keys)) !== JSON.stringify(pick(initialRef.current, keys));
  }, [formData]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: '' }));
  };

  const onPhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select a valid image file.'); return; }
    if (file.size > 3 * 1024 * 1024) { setError('Image must be under 3MB.'); return; }
    setError('');
    try {
      const dataUrl = await compressImage(file, 640, 640, 0.75);
      setFormData((prev) => ({ ...prev, photo: dataUrl }));
      setSuccess('');
    } catch { setError('Failed to process image.'); }
  };

  const removePhoto = () => setFormData((prev) => ({ ...prev, photo: '' }));

  const startEdit = () => { setSuccess(''); setError(''); setEditMode(true); };
  const cancelEdit = () => {
    setFormData(initialRef.current);
    setEditMode(false);
    setFieldErrors({});
    setSuccess('');
    setError('');
  };

  const validate = () => {
    const fe = {};
    if (!formData.name.trim()) fe.name = 'Name is required';
    if (!formData.officerId.trim()) fe.officerId = 'Officer ID is required';
    if (!formData.username.trim()) fe.username = 'Username is required';
    if (!formData.email.trim()) fe.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) fe.email = 'Invalid email';
    if (!formData.contactNumber.trim()) fe.contactNumber = 'Contact number is required';
    if (!formData.station.trim()) fe.station = 'Station is required';
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const saveChanges = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(''); setSuccess('');
    try {
      const payload = {
        name: formData.name.trim(),
        officerId: formData.officerId.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        station: formData.station.trim(),
        username: formData.username.trim(),
        role: formData.role,
        photo: formData.photo || '',
        isActive: !!formData.isActive,
      };
      const res = await axiosInstance.put(`/officers/${id}`, payload);
      const normalized = normalizeForForm(res.data);
      setOfficer(res.data);
      setFormData(normalized);
      initialRef.current = normalized;
      setEditMode(false);
      setSuccess('Officer details updated successfully.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to update officer.';
      setError(msg);
    } finally { setSaving(false); }
  };

  const quickToggleStatus = async (nextActive) => {
    setToggling(true);
    setError(''); setSuccess('');
    try {
      const res = await axiosInstance.put(`/officers/${id}`, { isActive: nextActive });
      const normalized = normalizeForForm(res.data);
      setOfficer(res.data);
      setFormData(normalized);
      initialRef.current = normalized;
      setSuccess(nextActive ? 'Officer activated.' : 'Officer deactivated.');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to update status.';
      setError(msg);
    } finally { setToggling(false); }
  };

  const hardDelete = async () => {
    setDeleting(true);
    setError(''); setSuccess('');
    try {
      await axiosInstance.delete(`/officers/${id}/hard`);
      navigate('/admin/officers');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to delete officer.';
      setError(msg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0B214A]">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin w-5 h-5" />
          <span>Loading officer profile…</span>
        </div>
      </div>
    );
  }
  if (error && !officer) return <div className="p-8 text-red-600 font-semibold">{error}</div>;
  if (!officer) return <div className="p-8 text-red-600 font-semibold">Officer not found.</div>;

  const initials = (formData?.name || '').split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-6 py-10 text-[#0B214A]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-4 mb-4 flex items-center justify-between sticky top-4 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D6DEEB] hover:bg-[#F5F7FB]">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-lg font-semibold">Officer Profile</div>
            <span className={`ml-2 px-2 py-1 text-xs rounded-full font-semibold ${officer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {officer.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              {!editMode ? (
                <>
                  <button onClick={startEdit} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00296B] text-white hover:opacity-90">
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => quickToggleStatus(!officer.isActive)}
                    disabled={toggling}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white ${
                      officer.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {officer.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#991b1b] text-white hover:bg-[#7f1d1d]"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={saveChanges}
                    disabled={saving || !isDirty}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white ${isDirty ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'}`}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                  <button onClick={cancelEdit} disabled={saving} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 text-[#0B214A] hover:bg-gray-300">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-600 text-green-700 px-4 py-2 text-sm">{success}</div>}
        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-600 text-red-700 px-4 py-2 text-sm">{error}</div>}

        <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            {formData?.photo ? (
              <img src={formData.photo} alt={`${formData.name} profile`} className="w-28 h-28 rounded-full object-cover border border-gray-300" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#EAF0FF] border border-gray-300 flex items-center justify-center text-2xl font-bold text-[#00296B]">
                {initials || '👤'}
              </div>
            )}

            <div className="flex-1">
              <div className="text-2xl font-bold">{formData?.name}</div>
              <div className="text-sm text-[#5A6B85]">Officer ID: {formData?.officerId}</div>
              <div className="text-xs text-[#5A6B85] mt-1">Joined {officer.createdAt ? new Date(officer.createdAt).toLocaleString() : '—'}</div>
            </div>

            {isAdmin && editMode && (
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00296B] text-white cursor-pointer hover:opacity-90">
                  <ImagePlus className="w-4 h-4" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onPhotoSelect} />
                </label>
                {formData?.photo && (
                  <button type="button" onClick={removePhoto} className="px-3 py-2 rounded-lg bg-gray-200 text-[#0B214A] hover:bg-gray-300">
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          <form onSubmit={saveChanges} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <FormField label="Full Name" name="name" value={formData?.name || ''} onChange={onChange} disabled={!editMode} error={fieldErrors.name} />
            <FormField label="Officer ID" name="officerId" value={formData?.officerId || ''} onChange={onChange} disabled={!editMode} error={fieldErrors.officerId} />
            <FormField label="Email" name="email" type="email" value={formData?.email || ''} onChange={onChange} disabled={!editMode} error={fieldErrors.email} />
            <FormField label="Contact Number" name="contactNumber" value={formData?.contactNumber || ''} onChange={onChange} disabled={!editMode} error={fieldErrors.contactNumber} />
            <FormField label="Station" name="station" value={formData?.station || ''} onChange={onChange} disabled={!editMode} error={fieldErrors.station} />
            <FormField label="Username" name="username" value={formData?.username || ''} onChange={onChange} disabled={!editMode} error={fieldErrors.username} />

            <div>
              <label className="block text-xs font-semibold text-[#003366] uppercase mb-1">Role</label>
              <select
                name="role"
                value={formData?.role || 'Officer'}
                onChange={onChange}
                disabled={!editMode}
                className="w-full bg-[#F9FAFB] border border-gray-300 rounded-md px-4 py-2 text-[#0B214A] font-medium disabled:opacity-70"
              >
                <option>Officer</option>
                <option>IT Officer</option>
                
              </select>
            </div>

            <div className="col-span-full">
              <label className="block text-xs font-semibold text-[#003366] uppercase mb-1">Status</label>
              {editMode ? (
                <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${formData?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {formData?.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!formData?.isActive}
                    onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                    className="sr-only"
                  />
                  <span className={`w-12 h-6 rounded-full relative transition ${formData?.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formData?.isActive ? 'translate-x-6' : ''}`} />
                  </span>
                  <span className="text-sm text-[#5A6B85]">Toggle to {formData?.isActive ? 'deactivate' : 'activate'}</span>
                </label>
              ) : (
                <div className={`inline-flex px-3 py-2 rounded-full text-xs font-semibold ${officer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {officer.isActive ? 'Active' : 'Inactive'}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Officer Permanently"
          message="This will permanently remove the officer record. This action cannot be undone."
          confirmText={deleting ? 'Deleting…' : 'Delete'}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={hardDelete}
          danger
          disabled={deleting}
        />
      )}
    </div>
  );
};

const FormField = ({ label, name, value, onChange, type = 'text', disabled = false, error = '' }) => (
  <div>
    <label className="block text-xs font-semibold text-[#003366] uppercase mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full bg-[#F9FAFB] border rounded-md px-4 py-2 text-[#0B214A] font-medium disabled:opacity-70 ${error ? 'border-red-400' : 'border-gray-300'}`}
    />
    {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
  </div>
);

const ConfirmModal = ({ title, message, confirmText = 'Confirm', onClose, onConfirm, danger = false, disabled = false }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[#5A6B85] mb-6">{message}</p>
      <div className="flex items-center justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#D6DEEB] hover:bg-[#F5F7FB]">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0B214A] hover:opacity-95'} disabled:opacity-60`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default OfficerProfile;
