import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Eye, RefreshCcw, Download,
  Users, UserCheck, UserCog, ShieldCheck, ChevronUp, ChevronDown
} from 'lucide-react';

const Officers = () => {
  const navigate = useNavigate();

  // filters/sort/pagination
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All'); // All | Active | Deactivated
  const [station, setStation] = useState('All');
  const [hideAdmins, setHideAdmins] = useState(true);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // data
  const [rows, setRows] = useState([]);
  const [stations, setStations] = useState(['All']);
  const [kpis, setKpis] = useState({ activeCount: 0, officer: 0, it: 0, admin: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // fetch on changes (debounced search)
  useEffect(() => {
    const h = setTimeout(() => {
      (async () => {
        setLoading(true);
        setErr('');
        try {
          const res = await axiosInstance.get('/officers', {
            params: {
              q,
              role,
              status, // controller accepts 'Deactivated' or 'Inactive'
              station,
              hideAdmins,
              sort: `${sortKey}:${sortDir}`,
              page,
              pageSize,
            },
          });
          setRows(res.data.data || []);
          setStations(res.data.stations || ['All']);
          setKpis(res.data.kpis || { activeCount: 0, officer: 0, it: 0, admin: 0 });
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        } catch (e) {
          setErr(e?.response?.data?.message || 'Failed to fetch officers.');
        } finally {
          setLoading(false);
        }
      })();
    }, 250);
    return () => clearTimeout(h);
  }, [q, role, status, station, hideAdmins, sortKey, sortDir, page, pageSize]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'createdAt' ? 'desc' : 'asc'); }
    setPage(1);
  };
  const SortIcon = ({ col }) => (sortKey === col ? (sortDir === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />) : <span className="inline-block w-4" />);

  const start = (page - 1) * pageSize;

  const downloadCSV = () => {
    const header = ['Name','OfficerID','Email','Contact','Station','Role','Status','Joined'];
    const body = rows.map(o => [
      o.name || '',
      o.officerId || '',
      o.email || '',
      o.contactNumber || '',
      o.station || '',
      o.role || '',
      o.isActive ? 'Active' : 'Deactivated',
      o.createdAt ? new Date(o.createdAt).toISOString() : ''
    ]);
    const csv = [header, ...body].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'officers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A] px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Officer Directory</h1>
          <p className="text-sm text-[#5A6B85] mt-1">Search, filter, and manage officers</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Kpi icon={<Users className="w-5 h-5" />} label="Active Officers" value={kpis.activeCount} />
          <Kpi icon={<UserCheck className="w-5 h-5" />} label="Officers" value={kpis.officer} />
          <Kpi icon={<UserCog className="w-5 h-5" />} label="IT Officers" value={kpis.it} />
          <Kpi icon={<ShieldCheck className="w-5 h-5" />} label="Admins" value={kpis.admin} />
        </div>

        {/* Controls */}
        <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#6B7A99] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6DEEB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00296B]"
                placeholder="Search by name, officer ID, email, username, station…"
                value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6B7A99]" />
              <select className="px-3 py-2 rounded-lg border border-[#D6DEEB] bg-white text-sm" value={role} onChange={(e)=>{setRole(e.target.value); setPage(1);}}>
                <option>All</option><option>Officer</option><option>IT Officer</option><option>Admin</option>
              </select>
              <select className="px-3 py-2 rounded-lg border border-[#D6DEEB] bg-white text-sm" value={status} onChange={(e)=>{setStatus(e.target.value); setPage(1);}}>
                <option>All</option><option>Active</option><option>Deactivated</option>
              </select>
              <select className="px-3 py-2 rounded-lg border border-[#D6DEEB] bg-white text-sm" value={station} onChange={(e)=>{setStation(e.target.value); setPage(1);}}>
                {(stations || ['All']).map(s => <option key={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm px-2">
                <input type="checkbox" className="accent-[#0B214A]" checked={hideAdmins} onChange={()=>{setHideAdmins(v=>!v); setPage(1);}} />
                Hide Admins
              </label>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <select className="px-3 py-2 rounded-lg border border-[#D6DEEB] bg-white text-sm" value={pageSize} onChange={(e)=>{setPageSize(parseInt(e.target.value,10)); setPage(1);}}>
                {[10,20,50].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
              <button
                onClick={() => { setQ(''); setRole('All'); setStatus('All'); setStation('All'); setHideAdmins(true); setSortKey('createdAt'); setSortDir('desc'); setPage(1); }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D6DEEB] text-sm hover:bg-[#F7FAFF]"
              >
                <RefreshCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={downloadCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B214A] text-white text-sm hover:opacity-95">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <SkeletonTable />
        ) : err ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{err}</div>
        ) : rows.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">No matching officers found.</div>
        ) : (
          <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F5F7FB] text-[#00296B] text-xs uppercase">
                <tr>
                  <Th onClick={()=>toggleSort('name')} active={sortKey==='name'}>Name <SortIcon col="name" /></Th>
                  <Th onClick={()=>toggleSort('officerId')} active={sortKey==='officerId'}>Officer ID <SortIcon col="officerId" /></Th>
                  <Th onClick={()=>toggleSort('email')} active={sortKey==='email'}>Email <SortIcon col="email" /></Th>
                  <Th>Contact</Th>
                  <Th onClick={()=>toggleSort('station')} active={sortKey==='station'}>Station <SortIcon col="station" /></Th>
                  <Th onClick={()=>toggleSort('role')} active={sortKey==='role'}>Role <SortIcon col="role" /></Th>
                  <Th onClick={()=>toggleSort('createdAt')} active={sortKey==='createdAt'}>Joined <SortIcon col="createdAt" /></Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(o => (
                  <tr key={o._id} className="border-t border-[#F0F2F7] hover:bg-[#FFFBEA]">
                    <Td><div className="flex items-center gap-2"><Avatar name={o.name} /><div className="font-medium">{o.name}</div></div></Td>
                    <Td>{o.officerId}</Td>
                    <Td className="truncate max-w-[220px]">{o.email}</Td>
                    <Td>{o.contactNumber}</Td>
                    <Td>{o.station}</Td>
                    <Td>{o.role}</Td>
                    <Td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</Td>
                    <Td>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {o.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </Td>
                    <Td>
                      <button onClick={() => navigate(`/admin/officer/${o._id}`)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs hover:bg-[#F5F7FB]">
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEF2F7] text-sm">
              <div className="text-[#5A6B85]">
                Showing <span className="font-semibold">{start + 1}</span>–<span className="font-semibold">{Math.min(start + pageSize, start + rows.length)}</span> of <span className="font-semibold">{total}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-md border border-[#D6DEEB] disabled:opacity-50">Prev</button>
                <span className="px-2">Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-md border border-[#D6DEEB] disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Kpi = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-5 flex items-center justify-between">
    <div><div className="text-sm text-[#5A6B85]">{label}</div><div className="text-2xl font-extrabold mt-1">{value}</div></div>
    <div className="rounded-xl p-3 bg-[#F0F5FF] text-[#00296B]">{icon}</div>
  </div>
);
const Th = ({ children, onClick, active }) => (
  <th onClick={onClick} className={`px-4 py-3 text-left select-none ${onClick ? 'cursor-pointer' : ''} ${active ? 'text-[#0B214A]' : ''}`}>{children}</th>
);
const Td = ({ children }) => <td className="px-4 py-3 align-middle">{children}</td>;
const Avatar = ({ name }) => {
  const initials = (name || '').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return <div className="w-7 h-7 rounded-full bg-[#EAF0FF] text-[#00296B] flex items-center justify-center text-xs font-bold">{initials || '👤'}</div>;
};
const SkeletonTable = () => (
  <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow overflow-hidden">
    <div className="animate-pulse p-6 space-y-3">
      {[...Array(6)].map((_,i)=><div key={i} className={`h-5 bg-[#EEF2F7] rounded ${i===5?'w-2/3':''}`}></div>)}
    </div>
  </div>
);

export default Officers;
