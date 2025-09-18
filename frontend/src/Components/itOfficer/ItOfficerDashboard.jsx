import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCog, ShieldCheck, ClipboardList, Users2, LogOut } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const ItOfficerDashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({ activeCount: 0, officer: 0, it: 0, admin: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch officer KPIs (shows counts incl. IT officers)
        const offRes = await axiosInstance.get('/officers', { params: { page: 1, pageSize: 1 } });
        const k = offRes.data?.kpis || { activeCount: 0, officer: 0, it: 0, admin: 0 };
        setKpis(k);

        // Fetch IT/admin requests overview if available
        const reqRes = await axiosInstance.get('/requests', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { data: [] } }));
        const list = reqRes.data?.data?.docs || reqRes.data?.data || [];
        setRecentRequests(list.slice(0, 5));
      } catch (e) {
        // silent fail, global interceptor handles auth
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const quickStats = useMemo(() => ([
    { label: 'Active Staff', value: kpis.activeCount, icon: <ShieldCheck className="h-6 w-6" /> },
    { label: 'Officers', value: kpis.officer, icon: <Users2 className="h-6 w-6" /> },
    { label: 'IT Officers', value: kpis.it, icon: <ServerCog className="h-6 w-6" /> },
    { label: 'Admins', value: kpis.admin, icon: <ShieldCheck className="h-6 w-6" /> },
  ]), [kpis]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">IT Officer Dashboard</h1>
            <p className="text-sm text-[#5A6B85]">Systems overview and service requests</p>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EAF1FF] text-[#0B214A] hover:bg-[#DDE9FF] transition">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {quickStats.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-[#EEF2F7]">
              <div className="flex items-center justify-between">
                <div className="text-[#5A6B85] text-xs">{s.label}</div>
                <div className="text-[#0B214A]">{s.icon}</div>
              </div>
              <div className="mt-2 text-2xl font-semibold">{loading ? '—' : s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-[#EEF2F7]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Recent Requests</h2>
              <button onClick={() => navigate('/admin/requests')} className="text-sm text-[#2B6CB0] hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-[#5A6B85]">Loading…</p>
              ) : recentRequests.length === 0 ? (
                <p className="text-sm text-[#5A6B85]">No recent requests.</p>
              ) : (
                recentRequests.map((r) => (
                  <div key={r._id} className="px-4 py-3 rounded-lg border border-[#EEF2F7]">
                    <div className="text-sm font-medium">{r.subject || r.title || 'Request'}</div>
                    <div className="text-[11px] text-[#5A6B85]">{r.status || 'Pending'} • {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EEF2F7]">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/admin/officers')} className="w-full text-left px-4 py-3 rounded-lg border border-[#EEF2F7] hover:bg-[#EEF6FF] transition">Manage Officers</button>
              <button onClick={() => navigate('/admin/requests')} className="w-full text-left px-4 py-3 rounded-lg border border-[#EEF2F7] hover:bg-[#EEF6FF] transition">View Requests</button>
              <button onClick={() => navigate('/itOfficer/schedules')} className="w-full text-left px-4 py-3 rounded-lg border border-[#EEF2F7] hover:bg-[#EEF6FF] transition">Manage Duty Schedules</button>
              <button onClick={() => navigate('/report-form')} className="w-full text-left px-4 py-3 rounded-lg border border-[#EEF2F7] hover:bg-[#EEF6FF] transition">Create Report</button>
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-[#5A6B85]">&copy; {new Date().getFullYear()} Police360 IT Panel</p>
      </div>
    </div>
  );
};

export default ItOfficerDashboard;


