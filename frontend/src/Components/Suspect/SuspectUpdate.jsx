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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(f.type)) {
      alert('Please select a valid image file (JPEG, JPG, PNG, or WEBP)');
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (f.size > maxSize) {
      alert('Image file size must be less than 5MB');
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate image dimensions (optional - can be added if needed)
    const img = new Image();
    img.onload = function() {
      if (this.width < 100 || this.height < 100) {
        alert('Image dimensions must be at least 100x100 pixels');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // If all validations pass, set the photo
      const url = URL.createObjectURL(f);
      setPhotoUrl(url);
      setPhotoFile(f);
    };
    img.onerror = function() {
      alert('Invalid image file. Please select a valid image.');
      e.target.value = ''; // Clear the input
    };
    img.src = URL.createObjectURL(f);
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

    // Validate required fields
    if (!form.suspectId || !form.nic || !form.name || !form.address || !form.gender || !form.suspectStatus) {
      alert('Please fill in all required fields: Suspect ID, NIC, Name, Address, Gender, and Suspect Status');
      return;
    }

    // Validate NIC number format
    if (form.nic.length !== 12) {
      alert('NIC number must be exactly 12 digits');
      return;
    }

    // Validate name length
    if (form.name.length < 2) {
      alert('Name must be at least 2 characters long');
      return;
    }

    // Validate address length
    if (form.address.length < 10) {
      alert('Address must be at least 10 characters long');
      return;
    }

    // Validate DOB if provided
    if (form.dob.d && form.dob.m && form.dob.y) {
      const day = Number(form.dob.d);
      const month = Number(form.dob.m);
      const year = Number(form.dob.y);
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      
      const date = new Date(year, month - 1, day);
      const isValidDate = date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
      
      if (!isValidDate) {
        alert('Please enter a valid date of birth');
        return;
      }
      
      if (age < 0 || age > 120) {
        alert('Age must be between 0-120 years');
        return;
      }
    }

    // Validate status-specific fields
    if (form.suspectStatus === 'wanted' && form.rewardPrice) {
      const reward = Number(form.rewardPrice);
      if (reward < 1000 || reward > 10000000) {
        alert('Reward price must be between 1,000 - 10,000,000 LKR');
        return;
      }
    }

    if (form.suspectStatus === 'in prison' && form.prisonDays) {
      const days = Number(form.prisonDays);
      if (days < 1 || days > 36500) {
        alert('Prison time must be between 1-36,500 days (100 years)');
        return;
      }
    }

    if (form.suspectStatus === 'arrested' && form.arrestDate) {
      if (new Date(form.arrestDate) > new Date()) {
        alert('Arrest date cannot be in the future');
        return;
      }
    }

    if (form.suspectStatus === 'released' && form.releaseDate) {
      if (new Date(form.releaseDate) > new Date()) {
        alert('Release date cannot be in the future');
        return;
      }
    }

    // Validate uploaded files before processing
    if (photoFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(photoFile.type)) {
        alert('Profile photo must be a valid image file (JPEG, JPG, PNG, or WEBP)');
        return;
      }
      if (photoFile.size > 5 * 1024 * 1024) {
        alert('Profile photo file size must be less than 5MB');
        return;
      }
    }

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
                <input 
                  value={form.nic} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length <= 12) {
                      update('nic', value);
                    }
                  }}
                  placeholder="123456789012"
                  maxLength={12}
                  className="block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
                />
                {form.nic && form.nic.length !== 12 && (
                  <p className="text-xs text-red-500 mt-1">NIC must be exactly 12 digits</p>
                )}
              </div>
            </div>

            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Full Name *</label>
            <input 
              value={form.name} 
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
                if (value.length <= 50) {
                  update('name', value);
                }
              }}
              placeholder="Enter full name"
              maxLength={50}
              className="mb-3 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
            />
            {form.name && form.name.length < 2 && (
              <p className="text-xs text-red-500 mb-3">Name must be at least 2 characters long</p>
            )}

            <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Address *</label>
            <input 
              value={form.address} 
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s,.\-\-/]/g, ''); // Allow letters, numbers, spaces, commas, periods, hyphens, and forward slashes
                if (value.length <= 200) {
                  update('address', value);
                }
              }}
              placeholder="Enter full address"
              maxLength={200}
              className="mb-3 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" 
            />
            {form.address && form.address.length < 10 && (
              <p className="text-xs text-red-500 mb-3">Address must be at least 10 characters long</p>
            )}

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
                <input 
                  type="number" 
                  min={1000} 
                  max={10000000} 
                  step={1000} 
                  placeholder="Enter reward amount (min: 1,000 LKR)" 
                  value={form.rewardPrice} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '' || (Number(value) >= 1000 && Number(value) <= 10000000)) {
                      update('rewardPrice', value);
                    }
                  }}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" 
                />
                {form.rewardPrice && (Number(form.rewardPrice) < 1000 || Number(form.rewardPrice) > 10000000) && (
                  <p className="text-xs text-red-500 mt-1">Reward must be between 1,000 - 10,000,000 LKR</p>
                )}
              </div>
            )}

            {form.suspectStatus === 'arrested' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Arrest Date</label>
                <input 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  value={form.arrestDate} 
                  onChange={(e)=>update('arrestDate', e.target.value)} 
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" 
                />
                {form.arrestDate && new Date(form.arrestDate) > new Date() && (
                  <p className="text-xs text-red-500 mt-1">Arrest date cannot be in the future</p>
                )}
              </div>
            )}

            {form.suspectStatus === 'in prison' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Prison Time (days)</label>
                <input 
                  type="number" 
                  min={1} 
                  max={36500}
                  step={1} 
                  placeholder="Enter days (max: 100 years)" 
                  value={form.prisonDays} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '' || (Number(value) >= 1 && Number(value) <= 36500)) {
                      update('prisonDays', value);
                    }
                  }}
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" 
                />
                {form.prisonDays && (Number(form.prisonDays) < 1 || Number(form.prisonDays) > 36500) && (
                  <p className="text-xs text-red-500 mt-1">Prison time must be between 1-36,500 days (100 years)</p>
                )}
              </div>
            )}

            {form.suspectStatus === 'released' && (
              <div className="mt-3">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Release Date</label>
                <input 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  value={form.releaseDate} 
                  onChange={(e)=>update('releaseDate', e.target.value)} 
                  className="block w-full rounded border border-gray-300 px-3 py-2 text-sm" 
                />
                {form.releaseDate && new Date(form.releaseDate) > new Date() && (
                  <p className="text-xs text-red-500 mt-1">Release date cannot be in the future</p>
                )}
              </div>
            )}

            <div className="mt-3">
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-gray-600">Date of Birth</label>
              <div className="flex items-center gap-2">
                <input 
                  placeholder="DD" 
                  maxLength={2}
                  value={form.dob.d} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    if (value.length <= 2 && (value === '' || (Number(value) >= 1 && Number(value) <= 31))) {
                      update('dob', { ...form.dob, d: value });
                    }
                  }}
                  className="h-9 w-12 rounded border border-gray-300 px-2 text-center text-sm" 
                />
                <input 
                  placeholder="MM" 
                  maxLength={2}
                  value={form.dob.m} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    if (value.length <= 2 && (value === '' || (Number(value) >= 1 && Number(value) <= 12))) {
                      update('dob', { ...form.dob, m: value });
                    }
                  }}
                  className="h-9 w-12 rounded border border-gray-300 px-2 text-center text-sm" 
                />
                <input 
                  placeholder="YYYY" 
                  maxLength={4}
                  value={form.dob.y} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    if (value.length <= 4) {
                      // Allow typing any 4-digit year, validation happens on blur or form submission
                      update('dob', { ...form.dob, y: value });
                    }
                  }}
                  className="h-9 w-16 rounded border border-gray-300 px-2 text-center text-sm" 
                />
              </div>
              {(() => {
                const { d, m, y } = form.dob;
                if (d && m && y) {
                  const day = Number(d);
                  const month = Number(m);
                  const year = Number(y);
                  const currentYear = new Date().getFullYear();
                  const age = currentYear - year;
                  
                  // Check if date is valid
                  const date = new Date(year, month - 1, day);
                  const isValidDate = date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
                  
                  if (!isValidDate) {
                    return <p className="text-xs text-red-500 mt-1">Please enter a valid date</p>;
                  }
                  if (age < 0 || age > 120) {
                    return <p className="text-xs text-red-500 mt-1">Age must be between 0-120 years</p>;
                  }
                }
                return null;
              })()}
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
              <button type="button" onClick={()=>photoRef.current?.click()} className="mt-2 w-40 rounded border border-gray-400 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">Upload Photo (Optional)</button>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" ref={photoRef} onChange={handlePhoto} className="hidden" />
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
