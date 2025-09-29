import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ItCasesPanel = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
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

      const casesRes = await axiosInstance.get('/cases', { params: { ...params, page: 1, pageSize: 50 } });
      const casesList = casesRes.data?.data || casesRes.data || [];
      setCases(Array.isArray(casesList) ? casesList : []);
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


  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]"><PoliceHeader /><div className="max-w-7xl mx-auto px-4 py-10">Loading…</div></div>;
  }

  const exportExcelCase = () => {
    try {
      if (!cases || cases.length === 0) {
        alert('No cases to export');
        return;
      }

      const rows = cases.map((item) => ({
        'Case ID': item._id || '',
        'Complainant': item.complainant?.name || '',
        'Type': item.complaintDetails?.typeOfComplaint || '',
        'Status': item.status || '',
        'Location': item.complaintDetails?.location || '',
        'Assigned Officer': item.assignedOfficer ? (item.assignedOfficer.name || item.assignedOfficer.officerId) : 'Unassigned',
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases');

      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const filename = `cases-${new Date().toISOString().slice(0,10)}.xlsx`;
      saveAs(blob, filename);
    } catch (e) {
      console.error('exportExcelCase error', e);
      alert('Failed to generate Excel file');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Complaints</h1>
            <p className="text-sm text-[#5A6B85] mt-1">Submitted criminal complaints — assign officers and view details</p>
          </div>
          <div className="absolute right-0 top-0 flex gap-2">
            <button onClick={() => navigate('/create-case')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#0B214A] text-white text-sm hover:bg-[#0A1E42]">+ Create Cases</button>
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
              {/* Export Excel */}
                <button
                  onClick={exportExcelCase}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  title="Download Excel"
                >
                  Export Excel
                </button>
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
