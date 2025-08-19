import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import {
  FileText,
  UserCheck,
  UserPlus,
  Users,
  ShieldCheck,
  UserCog,
  BarChart3,
  LogOut,
  Search,
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [officers, setOfficers] = useState([]); // recent list (5)
  const [kpis, setKpis] = useState({ activeCount: 0, officer: 0, it: 0, admin: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        // Ask backend for the most recent 5 officers + KPI totals
        const res = await axiosInstance.get('/officers', {
          params: {
            q: '',
            role: 'All',
            status: 'All',          // include Active + Deactivated
            station: 'All',
            hideAdmins: 'false',    // show admins in KPIs/recent
            sort: 'createdAt:desc',
            page: 1,
            pageSize: 5,
          },
        });
        setOfficers(res.data?.data || []);
        setKpis(res.data?.kpis || { activeCount: 0, officer: 0, it: 0, admin: 0 });
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load officers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recent = useMemo(() => officers, [officers]);

  const quickJump = async () => {
    const term = q.trim();
    if (!term) return;
    try {
      // Use the search API so we don't rely on the limited recent list
      const res = await axiosInstance.get('/officers/search', {
        params: {
          query: term,
          role: 'All',
          status: 'All',
          station: 'All',
          hideAdmins: 'true',
          limit: 1,
        },
      });
      const hit = Array.isArray(res.data) ? res.data[0] : null;
      if (hit?._id) navigate(`/admin/officer/${hit._id}`);
    } catch {
      // swallow errors for quick jump
    }
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      {/* Top bar */}
      <div className="border-b border-[#E4E9F2] bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#00296B]" />
            <div>
              <div className="text-sm text-[#5A6B85]">Police360</div>
              <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7A99] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="pl-9 pr-3 py-2 rounded-lg text-sm border border-[#D6DEEB] bg-white w-64 focus:outline-none focus:ring-2 focus:ring-[#00296B]"
                placeholder="Jump by Officer ID / Username / Email"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && quickJump()}
              />
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B214A] text-white hover:opacity-95"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, Admin</h2>
          <p className="text-sm text-[#5A6B85] mt-1">Manage officers, review reports, and keep the system running smoothly.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KpiCard icon={<Users className="w-5 h-5" />} label="Active Officers" value={loading ? '—' : kpis.activeCount} />
          <KpiCard icon={<UserCheck className="w-5 h-5" />} label="Officers" value={loading ? '—' : kpis.officer} />
          <KpiCard icon={<UserCog className="w-5 h-5" />} label="IT Officers" value={loading ? '—' : kpis.it} />
          <KpiCard icon={<ShieldCheck className="w-5 h-5" />} label="Admins" value={loading ? '—' : kpis.admin} />
        </div>

        {/* Main actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ActionCard
            icon={<FileText className="h-10 w-10" />}
            title="View Reports"
            desc="Access complaints, accidents, and summarized analytics."
            onClick={() => navigate('/admin/reports')}
          />
          <ActionCard
            icon={<UserCheck className="h-10 w-10" />}
            title="Manage Officers"
            desc="View, edit, deactivate or delete officer accounts."
            onClick={() => navigate('/admin/officers')}
          />
          <ActionCard
            icon={<UserPlus className="h-10 w-10" />}
            title="Register Officer"
            desc="Onboard new officers with secure credentials."
            onClick={() => navigate('/admin/register-officer')}
          />
        </div>

        {/* Secondary row: analytics + recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-[#E4E9F2] shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00296B]" />
                <h3 className="text-lg font-semibold">Role Distribution</h3>
              </div>
              <span className="text-xs text-[#5A6B85]">{loading ? 'Loading…' : 'Live'}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <MiniStat label="Officers" value={loading ? '—' : kpis.officer} />
              <MiniStat label="IT Officers" value={loading ? '—' : kpis.it} />
              <MiniStat label="Admins" value={loading ? '—' : kpis.admin} />
            </div>
            <div className="mt-6 text-xs text-[#5A6B85]">
              Tip: Click “Manage Officers” to view details and trends.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recently Added</h3>
            <div className="space-y-3">
              {loading ? (
                <SkeletonRow />
              ) : recent.length ? (
                recent.map((o) => (
                  <button
                    key={o._id}
                    onClick={() => navigate(`/admin/officer/${o._id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-[#EEF2F7] hover:bg-[#fefce8] transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">{o.name}</div>
                      <div className="text-[11px] text-[#5A6B85]">
                        {o.role} • {o.officerId} • {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold ${o.isActive ? 'text-green-700' : 'text-red-600'}`}>
                      {o.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-sm text-[#5A6B85]">No officers found.</div>
              )}
            </div>
          </div>
        </div>a

        <p className="mt-12 text-center text-xs text-[#5A6B85]">
          &copy; {new Date().getFullYear()} Police360 Admin Panel
        </p>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-5 flex items-center justify-between">
    <div>
      <div className="text-sm text-[#5A6B85]">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
    <div className="rounded-xl p-3 bg-[#F0F5FF] text-[#00296B]">{icon}</div>
  </div>
);

const ActionCard = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white border border-[#E4E9F2] rounded-2xl p-6 text-left shadow hover:shadow-lg transition hover:-translate-y-0.5"
  >
    <div className="mb-3 text-[#00296B]">{icon}</div>
    <div className="text-lg font-semibold">{title}</div>
    <div className="text-sm text-[#5A6B85] mt-1">{desc}</div>
  </button>
);

const MiniStat = ({ label, value }) => (
  <div className="rounded-xl border border-[#EEF2F7] bg-[#FAFBFF] p-4">
    <div className="text-sm text-[#5A6B85]">{label}</div>
    <div className="text-xl font-bold mt-1">{value}</div>
  </div>
);

const SkeletonRow = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-10 bg-[#EEF2F7] rounded-lg" />
    <div className="h-10 bg-[#EEF2F7] rounded-lg" />
    <div className="h-10 bg-[#EEF2F7] rounded-lg" />
  </div>
);

export default AdminDashboard;
