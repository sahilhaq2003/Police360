import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import axiosInstance from '../../utils/axiosInstance';
import { getMediaUrl } from '../../utils/mediaUrl';

export default function SuspectUpdate() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const location = useLocation();
  const queryId = new URLSearchParams(location.search).get('id');
  const suspectIdParam = routeId || queryId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [loadedSuspect, setLoadedSuspect] = useState(null);

  const [form, setForm] = useState({
    suspectId: '',
    nic: '',
    name: '',
    address: '',
    gender: '',
    citizen: '',
    dob: { d: '', m: '', y: '' },
    crimeInfo: '',
    suspectStatus: '',
    rewardPrice: '',
    arrestDate: '',
    prisonDays: '',
    releaseDate: '',
  });

  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const photoRef = useRef(null);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    const load = async () => {
      if (!suspectIdParam) { setError('No suspect id provided'); setLoading(false); return; }
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/suspects/${suspectIdParam}`);
        const s = res.data;
        setLoadedSuspect(s);
        setForm({
          suspectId: s.suspectId || '',
          nic: s.nic || '',
          name: s.name || '',
          address: s.address || '',
          gender: s.gender || '',
          citizen: s.citizen || '',
          dob: s.dob ? {
            d: s.dob.day ? String(s.dob.day) : '',
            m: s.dob.month ? String(s.dob.month) : '',
            y: s.dob.year ? String(s.dob.year) : '',
          } : { d: '', m: '', y: '' },
          crimeInfo: s.crimeInfo || '',
          suspectStatus: s.suspectStatus || '',
          rewardPrice: s.rewardPrice ? String(s.rewardPrice) : '',
          arrestDate: s.arrestDate ? new Date(s.arrestDate).toISOString().split('T')[0] : '',
          prisonDays: s.prisonDays ? String(s.prisonDays) : '',
          releaseDate: s.releaseDate ? new Date(s.releaseDate).toISOString().split('T')[0] : '',
        });
        setPhotoUrl(s.photo || '');
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || 'Failed to load suspect');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [suspectIdParam]);

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPhotoUrl(url);
    setPhotoFile(f);
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axiosInstance.post('/uploads/criminal', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data?.fileUrl || null;
    } catch (err) {
      console.error('Upload failed', err);
      return null;
    }
  };

  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!suspectIdParam) { alert('Missing suspect id'); return; }
    setSaving(true);
    try {
      const dobData = {};
      if (form.dob.d && form.dob.m && form.dob.y) {
        dobData.day = parseInt(form.dob.d);
        dobData.month = parseInt(form.dob.m);
        dobData.year = parseInt(form.dob.y);
      }

      let photo = photoUrl;
      if (photoFile) {
        const uploaded = await uploadFile(photoFile);
        if (uploaded) photo = uploaded;
      }

      const payload = {
        suspectId: form.suspectId || undefined,
        nic: form.nic || undefined,
        name: form.name || undefined,
        address: form.address || undefined,
        gender: form.gender || undefined,
        citizen: form.citizen || undefined,
        suspectStatus: form.suspectStatus || undefined,
        rewardPrice: form.suspectStatus === 'wanted' && form.rewardPrice ? parseInt(form.rewardPrice) : undefined,
        arrestDate: form.suspectStatus === 'arrested' && form.arrestDate ? new Date(form.arrestDate) : undefined,
        prisonDays: form.suspectStatus === 'in prison' && form.prisonDays ? parseInt(form.prisonDays) : undefined,
        releaseDate: form.suspectStatus === 'released' && form.releaseDate ? new Date(form.releaseDate) : undefined,
        dob: Object.keys(dobData).length ? dobData : undefined,
        crimeInfo: form.crimeInfo || undefined,
        photo,
      };

      await axiosInstance.put(`/suspects/${suspectIdParam}`, payload);
      alert('Suspect updated successfully');
  navigate(`/SuspectManage/SuspectProfile/${suspectIdParam}`);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to update suspect');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString(); };
  const formatDOB = (dob) => {
    if (!dob) return 'N/A';
    if (dob.day && dob.month && dob.year) return `${dob.day}/${dob.month}/${dob.year}`;
    if (dob.d && dob.m && dob.y) return `${dob.d}/${dob.m}/${dob.y}`;
    return 'N/A';
  };
  const getStatusBadge = (status) => {
    const map = {
      wanted: 'bg-red-100 text-red-800 border-red-200',
      arrested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in prison': 'bg-orange-100 text-orange-800 border-orange-200',
      released: 'bg-green-100 text-green-800 border-green-200'
    };
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status]||'bg-gray-100 text-gray-800 border-gray-200'}`}>{status?.toUpperCase()||'UNKNOWN'}</span>);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto mb-4"></div><p className="text-gray-600">Loading suspect...</p></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96"><div className="text-center"><div className="text-red-500 text-6xl mb-4">⚠️</div><h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2><p className="text-gray-600">{error}</p><button onClick={()=>window.history.back()} className="mt-4 px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700">Go Back</button></div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <br/>
      <br/>
      <h1 className="text-4xl font-extrabold tracking-tight text-center mb-10">Update Suspect Record</h1>

      <div className="mx-auto max-w-7xl border border-gray-300 rounded-4xl p-6 md:p-6 bg-white shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-15 w-15 rounded-full bg-[#0B214A] flex items-center justify-center">
              <img src="/src/assets/PLogo.png" alt="Police Logo" className="h-15 w-15 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-wide text-[#0B214A] bg-white p-2 rounded-md">SUSPECT RECORD</h1>
              <span className="text-[12px] text-gray-500 b">Editing existing record</span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-300 mb-10" />
        <h1 className="text-3xl font-semibold mx-auto max-w-7xl mb-10">Suspect Bio</h1>

        <form onSubmit={handleUpdate} className="mt-4 grid grid-cols-12 gap-4 bg-white p-4 rounded-md">
          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Suspect ID</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l px-3 py-2 text-sm text-gray-600">#</span>
                  <input value={form.suspectId} onChange={(e)=>update('suspectId', e.target.value)} className="block w-full rounded-r border border-gray-300 bg-white px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">NIC Number</label>
                <input value={form.nic} onChange={(e)=>update('nic', e.target.value)} className="block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" />
              </div>
            </div>

            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Full Name</label>
            <input value={form.name} onChange={(e)=>update('name', e.target.value)} className="mb-3 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" />

            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Address</label>
            <input value={form.address} onChange={(e)=>update('address', e.target.value)} className="mb-3 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Gender</label>
                <select value={form.gender} onChange={(e)=>update('gender', e.target.value)} className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Citizen (Optional)</label>
                <select value={form.citizen} onChange={(e)=>update('citizen', e.target.value)} className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="">Select Country</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Maldives">Maldives</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="China">China</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Honduras">Honduras</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Panama">Panama</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Jamaica">Jamaica</option>
                  <option value="Haiti">Haiti</option>
                  <option value="Dominican Republic">Dominican Republic</option>
                  <option value="Puerto Rico">Puerto Rico</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Suspect Status</label>
                <select value={form.suspectStatus} onChange={(e)=>update('suspectStatus', e.target.value)} className="block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="">Select Status</option>
                  <option value="wanted">Wanted</option>
                  <option value="arrested">Arrested</option>
                  <option value="in prison">In Prison</option>
                  <option value="released">Released</option>
                </select>
              </div>
            </div>

            {form.suspectStatus === 'wanted' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Reward Price (LKR)</label>
                <input type="number" min={0} step={1} placeholder="Enter reward amount" value={form.rewardPrice} onChange={(e)=>update('rewardPrice', e.target.value)} className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
            )}

            {form.suspectStatus === 'arrested' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Arrest Date</label>
                <input type="date" value={form.arrestDate} onChange={(e)=>update('arrestDate', e.target.value)} className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
            )}

            {form.suspectStatus === 'in prison' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Prison Time (days)</label>
                <input type="number" min={1} step={1} placeholder="Enter days" value={form.prisonDays} onChange={(e)=>update('prisonDays', e.target.value)} className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
            )}

            {form.suspectStatus === 'released' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Release Date</label>
                <input type="date" value={form.releaseDate} onChange={(e)=>update('releaseDate', e.target.value)} className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
            )}

            <div className="mt-3">
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">DOB</label>
              <div className="flex items-center gap-2">
                <input placeholder="DD" value={form.dob.d} onChange={(e)=>update('dob', { ...form.dob, d: e.target.value })} className="h-9 w-12 rounded border border-gray-300 px-2 text-center text-sm" />
                <input placeholder="MM" value={form.dob.m} onChange={(e)=>update('dob', { ...form.dob, m: e.target.value })} className="h-9 w-12 rounded border border-gray-300 px-2 text-center text-sm" />
                <input placeholder="YYYY" value={form.dob.y} onChange={(e)=>update('dob', { ...form.dob, y: e.target.value })} className="h-9 w-16 rounded border border-gray-300 px-2 text-center text-sm" />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Crime Info</label>
              <textarea rows={6} value={form.crimeInfo} onChange={(e)=>update('crimeInfo', e.target.value)} className="w-full rounded border border-gray-300 p-3 text-sm" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="flex flex-col items-center">
              <div className="flex h-80 w-56 items-center justify-center border border-gray-300 bg-gray-50">
                {photoUrl ? (
                  <img src={getMediaUrl(photoUrl)} alt="Photo" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">PHOTO</span>
                )}
              </div>
              <button type="button" onClick={()=>photoRef.current?.click()} className="mt-2 w-40 rounded border border-gray-400 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">Upload Photo</button>
              <input type="file" accept="image/*" ref={photoRef} onChange={handlePhoto} className="hidden" />
            </div>

            {loadedSuspect && (
              <div className="mt-6 bg-white rounded-md border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span>{getStatusBadge(loadedSuspect.suspectStatus)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Suspect ID</span><span className="font-mono">#{loadedSuspect.suspectId || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">NIC</span><span>{loadedSuspect.nic || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">File Number</span><span className="font-mono text-xs">{loadedSuspect.fileNumber || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Record ID</span><span className="font-mono text-xs">{loadedSuspect.recordId || 'N/A'}</span></div>
                  {loadedSuspect.suspectStatus === 'wanted' && loadedSuspect.rewardPrice ? (
                    <div className="flex justify-between"><span className="text-gray-500">Reward</span><span className="text-red-600 font-semibold">LKR {loadedSuspect.rewardPrice.toLocaleString()}</span></div>
                  ) : null}
                  {loadedSuspect.arrestDate ? (
                    <div className="flex justify-between"><span className="text-gray-500">Arrest Date</span><span>{formatDate(loadedSuspect.arrestDate)}</span></div>
                  ) : null}
                  {loadedSuspect.prisonDays ? (
                    <div className="flex justify-between"><span className="text-gray-500">Prison Days</span><span>{loadedSuspect.prisonDays}</span></div>
                  ) : null}
                  {loadedSuspect.releaseDate ? (
                    <div className="flex justify-between"><span className="text-gray-500">Release Date</span><span>{formatDate(loadedSuspect.releaseDate)}</span></div>
                  ) : null}
                  <div className="flex justify-between"><span className="text-gray-500">DOB</span><span>{formatDOB(loadedSuspect.dob)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="capitalize">{loadedSuspect.gender || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Citizen</span><span>{loadedSuspect.citizen || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="max-w-[12rem] truncate" title={loadedSuspect.address || 'N/A'}>{loadedSuspect.address || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Last Updated</span><span>{loadedSuspect.updatedAt ? formatDate(loadedSuspect.updatedAt) : 'N/A'}</span></div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex gap-4 justify-center mt-6">
          <button onClick={handleUpdate} disabled={saving} className="rounded bg-[#0B214A] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">{saving ? 'Saving...' : 'Update'}</button>
          <button onClick={()=>navigate(-1)} className="rounded border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cancel</button>
        </div>
      </div>
      <br/>
      <br/>
    </div>
  );
}
