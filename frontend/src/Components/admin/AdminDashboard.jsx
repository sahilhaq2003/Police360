import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import AdminHeader from '../AdminHeader/AdminHeader';
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
  CheckCircle2,
  Clock4,
  ClipboardCheck,
  Ban,
  CarFront,
  ListChecks,
  CalendarDays,
} from 'lucide-react';

const ACCIDENT_TYPE = 'Unknown Accident Report';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Officers
  const [officers, setOfficers] = useState([]);
  const [kpis, setKpis] = useState({ activeCount: 0, officer: 0, it: 0, admin: 0 });

  // Reports
  const [allReports, setAllReports] = useState([]);         // recent mix, we’ll split client-side
  const [accidentReports, setAccidentReports] = useState([]); // explicit accident fetch
  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    todayReports: 0,
    byStatus: { Pending: 0, 'Under Review': 0, 'In Progress': 0, Completed: 0, Rejected: 0 },
  });

  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');   // officer quick jump
  const [rq, setRq] = useState(''); // report quick jump

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const [officersRes, reportsRes, accRes, statsRes] = await Promise.all([
          axiosInstance.get('/officers', {
            params: {
              q: '',
              role: 'All',
              status: 'All',
              station: 'All',
              hideAdmins: 'false',
              sort: 'createdAt:desc',
              page: 1,
              pageSize: 5,
            },
          }),
          // Get a slightly larger pool to split into normal/accident on client
          axiosInstance.get('/reports', { params: { page: 1, limit: 15 } }),
          // Explicit Accident reports (server filter by reportType)
          axiosInstance.get('/reports', { params: { page: 1, limit: 10, reportType: ACCIDENT_TYPE } }),
          axiosInstance.get('/reports/stats'),
        ]);

        // Officers
        setOfficers(officersRes.data?.data || []);
        setKpis(officersRes.data?.kpis || { activeCount: 0, officer: 0, it: 0, admin: 0 });

        // Reports pool
        const pool = reportsRes.data?.data?.docs || reportsRes.data?.data || [];
        setAllReports(pool);

        // Accident reports direct
        const accDocs = accRes.data?.data?.docs || accRes.data?.data || [];
        setAccidentReports(accDocs);

        // Stats
        const raw = statsRes.data?.data || {};
        const mapStatus = { Pending: 0, 'Under Review': 0, 'In Progress': 0, Completed: 0, Rejected: 0 };
        (raw.statusStats || []).forEach(s => { mapStatus[s._id] = s.count; });
        setReportStats({
          totalReports: raw.totalReports || 0,
          todayReports: raw.todayReports || 0,
          byStatus: mapStatus,
        });
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Split into Normal vs Accident
  const normalReports = useMemo(
    () =>
      (allReports || [])
        .filter(r => r?.reportType !== ACCIDENT_TYPE)
        .slice(0, 10),
    [allReports]
  );
  const recentAccidentReports = useMemo(() => (accidentReports || []).slice(0, 10), [accidentReports]);

  const recentOfficers = useMemo(() => officers, [officers]);

  const quickJumpOfficer = async () => {
    const term = q.trim();
    if (!term) return;
    try {
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
    } catch {}
  };

  const quickJumpReport = async () => {
    const term = rq.trim();
    if (!term) return;
    try {
      const res = await axiosInstance.get('/reports', { params: { page: 1, limit: 1, search: term } });
      const list = res.data?.data?.docs || res.data?.data || [];
      const hit = list[0];
      if (hit?._id) navigate(`/admin/reports/${hit._id}`);
    } catch {}
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, Chief</h2>
          <p className="text-sm text-[#5A6B85] mt-1">Manage officers, review reports, and keep the system running smoothly.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {/* KPIs: Officers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KpiCard icon={<Users className="w-5 h-5" />} label="Active Officers" value={loading ? '—' : kpis.activeCount} />
          <KpiCard icon={<UserCheck className="w-5 h-5" />} label="Officers" value={loading ? '—' : kpis.officer} />
          <KpiCard icon={<UserCog className="w-5 h-5" />} label="IT Officers" value={loading ? '—' : kpis.it} />
          <KpiCard icon={<ShieldCheck className="w-5 h-5" />} label="Admins" value={loading ? '—' : kpis.admin} />
        </div>

        {/* MAIN ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
          <ActionCard
            icon={<ListChecks className="h-10 w-10" />}
            title="Officer Requests"
            desc="Review and approve/deny officer requests."
            onClick={() => navigate('/admin/requests')}
          />
          <ActionCard
            icon={<CalendarDays className="h-10 w-10" />}
            title="Duty Schedules"
            desc="View and search through all officer duty schedules."
            onClick={() => navigate('/admin/schedules')}
          />
        </div>

        {/* REPORTS STATS */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#00296B]" />
              <h3 className="text-lg font-semibold">Report Status Overview</h3>
            </div>
            <span className="text-xs text-[#5A6B85]">
              {loading ? 'Loading…' : `Total: ${reportStats.totalReports} • Today: ${reportStats.todayReports}`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ReportStatCard icon={<Clock4 className="w-4 h-4" />} label="Pending" value={loading ? '—' : reportStats.byStatus['Pending']} />
            <ReportStatCard icon={<ClipboardCheck className="w-4 h-4" />} label="Under Review" value={loading ? '—' : reportStats.byStatus['Under Review']} />
            <ReportStatCard icon={<FileText className="w-4 h-4" />} label="In Progress" value={loading ? '—' : reportStats.byStatus['In Progress']} />
            <ReportStatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Completed" value={loading ? '—' : reportStats.byStatus['Completed']} />
            <ReportStatCard icon={<Ban className="w-4 h-4" />} label="Rejected" value={loading ? '—' : reportStats.byStatus['Rejected']} />
          </div>
        </div>

        {/* TWO COLUMNS: NORMAL vs ACCIDENT REPORTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Normal Reports */}
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-[#00296B]" />
              <h3 className="text-lg font-semibold">Recent Reports</h3>
            </div>
            <div className="space-y-3">
              {loading ? (
                <SkeletonRow />
              ) : normalReports.length ? (
                normalReports.slice(0, 8).map(r => (
                  <ReportRow key={r._id} r={r} onOpen={() => navigate(`/admin/reports/${r._id}`)} />
                ))
              ) : (
                <div className="text-sm text-[#5A6B85]">No normal reports found.</div>
              )}
            </div>
          </div>

          {/* Accident Reports */}
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <CarFront className="w-5 h-5 text-[#C02020]" />
              <h3 className="text-lg font-semibold">Recent Accident Reports</h3>
            </div>
            <div className="space-y-3">
              {loading ? (
                <SkeletonRow />
              ) : recentAccidentReports.length ? (
                recentAccidentReports.slice(0, 8).map(r => (
                  <ReportRow key={r._id} r={r} onOpen={() => navigate(`/admin/reports/${r._id}`)} accent />
                ))
              ) : (
                <div className="text-sm text-[#5A6B85]">No accident reports found.</div>
              )}
            </div>
          </div>
        </div>

        {/* OFFICERS ROW */}
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
            <div className="mt-6 text-xs text-[#5A6B85]">Tip: Click “Manage Officers” to view details and trends.</div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recently Added Officers</h3>
            <div className="space-y-3">
              {loading ? (
                <SkeletonRow />
              ) : recentOfficers.length ? (
                recentOfficers.map((o) => (
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
        </div>

        <p className="mt-12 text-center text-xs text-[#5A6B85]">
          &copy; {new Date().getFullYear()} Police360 Admin Panel
        </p>
      </div>
    </div>
  );
};

/* ===== Reusable UI ===== */

const ReportRow = ({ r, onOpen, accent = false }) => {
  const badgeClass =
    r.status === 'Completed'
      ? 'bg-green-50 text-green-700 border border-green-200'
      : r.status === 'Rejected'
      ? 'bg-red-50 text-red-700 border border-red-200'
      : r.status === 'In Progress'
      ? 'bg-blue-50 text-blue-700 border border-blue-200'
      : r.status === 'Under Review'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-gray-50 text-gray-700 border border-gray-200';

  return (
    <button
      onClick={onOpen}
      className={`w-full text-left px-3 py-2 rounded-lg border border-[#EEF2F7] transition ${
        accent ? 'hover:bg-[#fff1f2]' : 'hover:bg-[#eef6ff]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {r.reportNumber || '—'} • {r.reportType}
          </div>
          <div className="text-[11px] text-[#5A6B85] truncate">
            {r.reporterName} • {new Date(r.submittedAt || r.createdAt).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#5A6B85] truncate">
            {r.incidentLocation} — {r.incidentDescription}
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${badgeClass}`}>{r.status}</span>
      </div>
    </button>
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

const ReportStatCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-[#EEF2F7] bg-[#FAFBFF] p-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-[#00296B]">{icon}</span>
      <div className="text-sm text-[#5A6B85]">{label}</div>
    </div>
    <div className="text-xl font-bold">{value}</div>
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
