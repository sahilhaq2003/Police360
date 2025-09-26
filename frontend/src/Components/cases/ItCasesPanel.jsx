import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const ItCasesPanel = () => {
  const [cases, setCases] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchField, setSearchField] = useState('ALL');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 450);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // re-fetch when search term changes
    fetchData();
  }, [debouncedSearch, onlyUnassigned]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // fetch cases and officers in parallel
      const params = { pageSize: 200 };
      if (onlyUnassigned) {
        params.unassigned = true;
        params.status = 'NEW';
      }
      if (debouncedSearch) {
        // The backend supports a single `q` param that searches id, complainant name, type, location and description.
        // Use `q` regardless of the selected searchField so behavior is consistent with server-side search.
        params.q = debouncedSearch;
      }

      const [casesRes, offRes] = await Promise.all([
        axiosInstance.get('/cases', { params: { ...params, page: 1, pageSize: 50 } }),
        axiosInstance.get('/officers', { params: { role: 'Officer', pageSize: 100, lite: 'true' } }),
      ]);

      const casesList = casesRes.data?.data || casesRes.data || [];
      const offList = offRes.data?.data || offRes.data || offRes.data?.items || [];

      setCases(Array.isArray(casesList) ? casesList : []);
      setOfficers(Array.isArray(offList) ? offList : []);
    } catch (e) {
      const isTimeout = e?.code === 'ECONNABORTED';
      console.error('Failed loading cases or officers', e);
      if (isTimeout) {
        alert('Request timed out. Please check the server and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startAssign = (c) => {
    setAssigningId(c._id);
    setSelectedOfficerId('');
  };

  const cancelAssign = () => {
    setAssigningId(null);
    setSelectedOfficerId('');
  };

  const confirmAssign = async (c) => {
    if (!selectedOfficerId) return alert('Please select an officer');
    try {
      const res = await axiosInstance.post(`/cases/${c._id}/assign`, { officerId: selectedOfficerId });
      const updated = res.data?.data || res.data;
      // update the case in-place so the Assigned Officer column shows immediately
      setCases(prev => prev.map(item => item._id === c._id ? updated : item));
      setAssigningId(null);
      setSelectedOfficerId('');
      alert('Assigned successfully');
    } catch (err) {
      console.error('Assign failed', err);
      alert(err?.response?.data?.message || 'Failed to assign');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]"><PoliceHeader /><div className="max-w-7xl mx-auto px-4 py-10">Loading…</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Complaints</h1>
            <p className="text-sm text-[#5A6B85] mt-1">Submitted criminal complaints — assign officers and view details</p>
          </div>
          <div className="absolute right-0 top-0">
            <button onClick={() => navigate('/itOfficer/ItOfficerDashboard')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">← Back</button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
              <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="border p-2 rounded-md text-sm">
                <option value="ALL">All</option>
                <option value="ID">Complaint ID</option>
                <option value="NAME">Complainant Name</option>
                <option value="TYPE">Complaint Type</option>
              </select>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchField === 'ALL' ? 'Search id, complainant, type, location...' : (searchField === 'ID' ? 'Enter complaint ID...' : (searchField === 'NAME' ? 'Search by complainant name...' : 'Search by complaint type...'))} className="border p-2 rounded-md text-sm w-72" />
              {search && <button onClick={() => { setSearch(''); setDebouncedSearch(''); }} className="text-sm text-slate-500">Clear</button>}
            </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyUnassigned} onChange={(e) => { setOnlyUnassigned(e.target.checked); fetchData(); }} />
              <span>Show only unassigned NEW complaints</span>
            </label>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">No cases found.</div>
        ) : (
          <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F5F7FB] text-[#00296B] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Complainant</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Assigned Officer</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c._id} className="border-t border-[#F0F2F7] hover:bg-[#FFFBEA]">
                    <td className="px-4 py-3 align-middle truncate max-w-[160px]">{c._id}</td>
                    <td className="px-4 py-3 align-middle">{c.complainant?.name}</td>
                    <td className="px-4 py-3 align-middle">{c.complaintDetails?.typeOfComplaint}</td>
                    <td className="px-4 py-3 align-middle">{c.status}</td>
                    <td className="px-4 py-3 align-middle truncate max-w-[220px]">{c.complaintDetails?.location || '—'}</td>
                    <td className="px-4 py-3 align-middle">{c.assignedOfficer ? (c.assignedOfficer.name || c.assignedOfficer.officerId) : '—'}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/cases/${c._id}`)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs hover:bg-[#F5F7FB]">View</button>
                        {assigningId === c._id ? (
                          <div className="flex items-center gap-2">
                            <select className="px-2 py-1 rounded-lg border border-[#D6DEEB] bg-white text-xs" value={selectedOfficerId} onChange={(e) => setSelectedOfficerId(e.target.value)}>
                              <option value="">Select officer…</option>
                              {officers.map(o => (
                                <option key={o._id} value={o._id}>{o.name || o.officerId || o.email}</option>
                              ))}
                            </select>
                            <button onClick={() => confirmAssign(c)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0B214A] text-white text-xs">Save</button>
                            <button onClick={cancelAssign} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => startAssign(c)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0B214A] text-white text-xs">Assign</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItCasesPanel;
