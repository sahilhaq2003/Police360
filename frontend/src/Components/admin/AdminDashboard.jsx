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
  Activity,
  TrendingUp,
  Clock,
  Badge,
  AlertTriangle,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <AdminHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Chief Command Center</h1>
              <p className="text-blue-100 mt-2">Welcome back, Chief</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Badge className="h-4 w-4" />
                  Administrative Control
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  System Management
                </span>
              </div>
            </div>
          </div>
        
          {/* Status Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Active Officers: {kpis.activeCount}</span>
            </div>
          </div>
        </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <div className="text-gray-700"><Users className="h-6 w-6" /></div>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Active Officers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    kpis.activeCount
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <div className="text-gray-700"><UserCheck className="h-6 w-6" /></div>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Field Officers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    kpis.officer
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <div className="text-gray-700"><UserCog className="h-6 w-6" /></div>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">IT Specialists</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    kpis.it
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <div className="text-gray-700"><ShieldCheck className="h-6 w-6" /></div>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Command Staff</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    kpis.admin
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Dashboard Layout */}
        <div className="space-y-8">
          {/* Primary Operations Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="h-7 w-7" />
                    Administrative Operations Center
                  </h2>
                  <p className="text-blue-100 mt-2">Access critical police systems and administrative tools</p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>System Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                  icon={<FileText className="h-7 w-7" />}
                  title="View Reports"
                  description="Access complaints, accidents, and summarized analytics"
                  onClick={() => navigate('/admin/reports')}
                  color="blue"
                  priority="high"
                />
                <ActionCard
                  icon={<UserCheck className="h-7 w-7" />}
                  title="Manage Officers"
                  description="View, edit, deactivate or delete officer accounts"
                  onClick={() => navigate('/admin/officers')}
                  color="green"
                  priority="high"
                />
                <ActionCard
                  icon={<UserPlus className="h-7 w-7" />}
                  title="Register Officer"
                  description="Onboard new officers with secure credentials"
                  onClick={() => navigate('/admin/register-officer')}
                  color="purple"
                  priority="high"
                />
                <ActionCard
                  icon={<ListChecks className="h-7 w-7" />}
                  title="Officer Requests"
                  description="Review and approve/deny officer requests"
                  onClick={() => navigate('/admin/requests')}
                  color="orange"
                  priority="medium"
                />
                <ActionCard
                  icon={<CalendarDays className="h-7 w-7" />}
                  title="Duty Schedules"
                  description="View and search through all officer duty schedules"
                  onClick={() => navigate('/admin/schedules')}
                  color="yellow"
                  priority="medium"
                />
              </div>
            </div>
          </div>

          {/* Report Status Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Report Status Overview
                </h3>
                <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                  {loading ? 'Loading…' : `Total: ${reportStats.totalReports} • Today: ${reportStats.todayReports}`}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Clock4 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{loading ? '—' : reportStats.byStatus['Pending']}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <ClipboardCheck className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{loading ? '—' : reportStats.byStatus['Under Review']}</div>
                  <div className="text-sm text-gray-600">Under Review</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{loading ? '—' : reportStats.byStatus['In Progress']}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{loading ? '—' : reportStats.byStatus['Completed']}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Ban className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{loading ? '—' : reportStats.byStatus['Rejected']}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Normal Reports */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Recent Reports
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {loading ? (
                    <SkeletonRow />
                  ) : normalReports.length ? (
                    normalReports.slice(0, 6).map(r => (
                      <ReportRow key={r._id} r={r} onOpen={() => navigate(`/admin/reports/${r._id}`)} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ListChecks className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No normal reports found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accident Reports */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CarFront className="h-5 w-5" />
                  Recent Accident Reports
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {loading ? (
                    <SkeletonRow />
                  ) : recentAccidentReports.length ? (
                    recentAccidentReports.slice(0, 6).map(r => (
                      <ReportRow key={r._id} r={r} onOpen={() => navigate(`/admin/reports/${r._id}`)} accent />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CarFront className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No accident reports found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Police360 Chief Command Center - Administrative Operations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Reusable UI ===== */

const ReportRow = ({ r, onOpen, accent = false }) => {
  const badgeClass =
    r.status === 'Completed'
      ? 'bg-gray-100 text-gray-700'
      : r.status === 'Rejected'
      ? 'bg-gray-100 text-gray-700'
      : r.status === 'In Progress'
      ? 'bg-gray-100 text-gray-700'
      : r.status === 'Under Review'
      ? 'bg-gray-100 text-gray-700'
      : 'bg-gray-100 text-gray-700';

  return (
    <button
      onClick={onOpen}
      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 group-hover:text-gray-800 transition-colors">
            {r.reportNumber || '—'} • {r.reportType}
          </div>
          <div className="text-xs text-gray-600 mt-1 truncate">
            {r.reporterName} • {new Date(r.submittedAt || r.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate">
            {r.incidentLocation}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>
          {r.status}
        </span>
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

const ActionCard = ({ icon, title, description, onClick, color = "blue", priority = "medium" }) => {
  const priorityClasses = {
    high: "ring-2 ring-gray-300 shadow-lg",
    medium: "ring-1 ring-gray-200 shadow-md",
    low: "shadow-sm"
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gray-300 ${priorityClasses[priority]}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-700">{icon}</div>
          {priority === 'high' && (
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

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
  <div className="animate-pulse space-y-3">
    <div className="h-16 bg-gray-200 rounded-lg" />
    <div className="h-16 bg-gray-200 rounded-lg" />
    <div className="h-16 bg-gray-200 rounded-lg" />
  </div>
);

export default AdminDashboard;
