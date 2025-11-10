import React, { useEffect, useState, useCallback, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ItCasesPanel = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchField, setSearchField] = useState('ALL');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch data function with proper error handling
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
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

      // Add timestamp to prevent caching without triggering CORS preflight
      const casesRes = await axiosInstance.get('/cases', { 
        params: { 
          ...params, 
          page: 1, 
          pageSize: 50,
          _t: Date.now() // Timestamp to prevent caching
        }
      });
      
      // Properly extract the cases array
      let casesList = [];
      if (casesRes.data) {
        if (Array.isArray(casesRes.data)) {
          casesList = casesRes.data;
        } else if (casesRes.data.data && Array.isArray(casesRes.data.data)) {
          casesList = casesRes.data.data;
        } else if (casesRes.data.cases && Array.isArray(casesRes.data.cases)) {
          casesList = casesRes.data.cases;
        }
      }
      
      // Log for debugging
      console.log('Fetched cases:', casesList.length, 'cases');
      console.log('Sample case:', casesList[0]);
      
      // Ensure assignedOfficer is properly populated and optionally filter by assigned officer
      const processedCases = casesList.map(c => {
        if (c.assignedOfficer && typeof c.assignedOfficer === 'string') {
          // assignedOfficer not populated (still an ID string)
          console.warn('assignedOfficer not populated for case:', c._id);
        }
        return c;
      });

      // Apply client-side filters: assigned/officer
      let final = processedCases;
      if (searchField === 'OFFICER' && debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        final = final.filter(item => {
          const ao = item.assignedOfficer;
          if (!ao) return false;
          if (typeof ao === 'string') {
            return ao.toLowerCase().includes(q);
          }
          const name = (ao.name || '').toLowerCase();
          const oid = (ao.officerId || '').toLowerCase();
          return name.includes(q) || oid.includes(q);
        });
      }

      if (showOnlyAssigned) {
        final = final.filter(item => !!item.assignedOfficer);
      }

      setCases(final);
    } catch (e) {
      const isTimeout = e?.code === 'ECONNABORTED';
      console.error('Failed loading cases:', e);
      setError(e?.response?.data?.message || e?.message || 'Failed to load cases');
      if (isTimeout) {
        alert('Request timed out. Please check the server and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [onlyUnassigned, debouncedSearch, searchField, showOnlyAssigned]);

  // Initial load and refresh when location changes (navigating back to this page)
  useEffect(() => {
    fetchData();
  }, [location.key, fetchData]);

  // Refresh when page becomes visible (user switches back to tab or window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          fetchData();
        }, 100);
      }
    };

    const handleFocus = () => {
      if (!loading) {
        // Refresh when window regains focus
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData, loading]);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 450);
    return () => clearTimeout(t);
  }, [search]);


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

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
              <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="border p-2 rounded-md text-sm">
                <option value="ALL">All</option>
                <option value="ID">Complaint ID</option>
                <option value="NAME">Complainant Name</option>
                <option value="TYPE">Complaint Type</option>
                <option value="OFFICER">Assigned Officer</option>
              </select>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={
                searchField === 'ALL' ? 'Search id, complainant, type, location...' :
                (searchField === 'ID' ? 'Enter complaint ID...' :
                (searchField === 'NAME' ? 'Search by complainant name...' :
                (searchField === 'TYPE' ? 'Search by complaint type...' :
                (searchField === 'OFFICER' ? 'Search by assigned officer name or ID...' : 'Search...'))))} className="border p-2 rounded-md text-sm w-72" />
              {search && <button onClick={() => { setSearch(''); setDebouncedSearch(''); }} className="text-sm text-slate-500">Clear</button>}
              {/* Refresh Button */}
              <button
                onClick={fetchData}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                title="Refresh cases"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
              {/* Export Excel */}
                <button
                  onClick={exportExcelCase}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  title="Download Excel"
                >
                  Export Excel
                </button>
            </div>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyUnassigned} onChange={(e) => { setOnlyUnassigned(e.target.checked); if (e.target.checked) setShowOnlyAssigned(false); }} />
              <span>Show only unassigned NEW complaints</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showOnlyAssigned} onChange={(e) => {
                const val = e.target.checked;
                setShowOnlyAssigned(val);
                if (val) {
                  setOnlyUnassigned(false);
                  // immediate local filter for snappy UI
                  setCases(prev => prev.filter(item => !!item.assignedOfficer));
                } else {
                  // restore full data from server
                  fetchData();
                }
              }} />
              <span>Show only assigned complaints</span>
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
                    <td className="px-4 py-3 align-middle">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                        c.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        c.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                        c.status === 'CLOSED' ? 'bg-green-100 text-green-800' :
                        c.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle truncate max-w-[220px]">{c.complaintDetails?.location || '—'}</td>
                    <td className="px-4 py-3 align-middle">
                      {c.assignedOfficer ? (
                        typeof c.assignedOfficer === 'object' && c.assignedOfficer !== null ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">
                              {c.assignedOfficer.name || c.assignedOfficer.officerId || 'Unknown'}
                            </span>
                            {c.assignedOfficer.officerId && c.assignedOfficer.name && (
                              <span className="text-xs text-slate-500">ID: {c.assignedOfficer.officerId}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">Assigned (ID: {c.assignedOfficer})</span>
                        )
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/cases/${c._id}`)} 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs hover:bg-[#F5F7FB] transition-colors"
                        >
                          View
                        </button>
                        {(!c.assignedOfficer || c.status === 'NEW') && (
                          <button 
                            onClick={() => navigate(`/create-case`, { state: { complaintId: c._id } })} 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0B214A] text-white text-xs hover:bg-[#0A1E42] transition-colors"
                            title="Create Case from this complaint"
                          >
                            Create Case
                          </button>
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
