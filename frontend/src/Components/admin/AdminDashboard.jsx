import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import AdminHeader from '../AdminHeader/AdminHeader';
import {
  UserCheck,
  UserPlus,
  Users,
  ShieldCheck,
  UserCog,
  BarChart3,
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
  Eye,
  ArrowRight,
} from 'lucide-react';

const ACCIDENT_TYPE = 'Unknown Accident Report';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Officers
  const [officers, setOfficers] = useState([]);
  const [kpis, setKpis] = useState({ activeCount: 0, officer: 0, it: 0, admin: 0 });

  // Reports
  const [complaintReports, setComplaintReports] = useState([]);
  const [accidentReports, setAccidentReports] = useState([]);

  // UI
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load officers data first
        const officersRes = await axiosInstance.get('/officers', {
          params: {
            q: '',
            role: 'All',
            status: 'All',
            station: 'All',
            hideAdmins: 'false',
            sort: 'createdAt:desc',
            page: 1,
            pageSize: 100, // Get more officers for accurate counts
          },
        });

        // Process officers data
        const officersData = officersRes.data?.data || [];
        const officersArray = Array.isArray(officersData) ? officersData : [];
        setOfficers(officersArray);

        console.log('Officers data loaded:', officersArray.length, 'officers');
        console.log('Server KPIs:', officersRes.data?.kpis);

        // Calculate KPIs from actual data
        const activeOfficers = officersArray.filter(o => o.isActive !== false);
        const fieldOfficers = officersArray.filter(o => o.role === 'Officer');
        const itOfficers = officersArray.filter(o => o.role === 'IT Officer');
        const adminOfficers = officersArray.filter(o => o.role === 'Admin');

        // Use server KPIs if available, otherwise calculate from data
        const serverKpis = officersRes.data?.kpis;
        setKpis({
          activeCount: serverKpis?.activeCount || activeOfficers.length,
          officer: serverKpis?.officer || fieldOfficers.length,
          it: serverKpis?.it || itOfficers.length,
          admin: serverKpis?.admin || adminOfficers.length,
        });

        // Load reports data (with error handling for each)
        try {
          // Backend returns various shapes (e.g. { reports: [...] } or { data: { reports: [...] } } ), so accept several
          const reportsRes = await axiosInstance.get('/reports');
          const allReports =
            reportsRes?.data?.reports ||
            reportsRes?.data?.data?.reports ||
            reportsRes?.data?.data ||
            reportsRes?.data ||
            [];

          // Debug logging to help trace why lists might be empty in the UI
          try {
            const total = Array.isArray(allReports) ? allReports.length : 0;
            console.log('AdminDashboard: fetched reports', { total, sample: Array.isArray(allReports) ? allReports.slice(0, 3) : allReports });
          } catch (logErr) {
            console.warn('AdminDashboard: could not log reports', logErr);
          }

          const complaintKeywords = [
            'complaint',
            'file criminal complaint',
            'police report',
            'police report inquiry',
            'criminal complaint',
          ];
          const complaintDocs = Array.isArray(allReports)
            ? allReports.filter(r => {
                const t = String(r.reportType || '').toLowerCase();
                return complaintKeywords.some(k => t.includes(k));
              })
            : [];
          setComplaintReports(complaintDocs.slice(0, 6));

          const accDocs = Array.isArray(allReports)
            ? allReports.filter(r => String(r.reportType || '').toLowerCase().includes('accident'))
            : [];
          setAccidentReports(accDocs.slice(0, 6));

          console.log('AdminDashboard: complaintCount, accidentCount', { complaints: complaintDocs.length, accidents: accDocs.length, totalFetched: Array.isArray(allReports) ? allReports.length : 0 });
        } catch (reportError) {
          // If reports fail, just set empty arrays and continue
          console.warn('Reports data failed to load:', reportError);
          setComplaintReports([]);
          setAccidentReports([]);
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
        // Don't show error for now, just set default values
        setOfficers([]);
        setKpis({ activeCount: 0, officer: 0, it: 0, admin: 0 });
        setComplaintReports([]);
        setAccidentReports([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Recent data
  const recentComplaintReports = useMemo(() => complaintReports.slice(0, 6), [complaintReports]);
  const recentAccidentReports = useMemo(() => accidentReports.slice(0, 6), [accidentReports]);
  const recentOfficers = useMemo(() => officers.slice(0, 5), [officers]);

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
              <h1 className="text-3xl md:text-4xl font-bold">Administrative Command Center</h1>
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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
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
                <div className="p-3 rounded-lg bg-green-100">
                  <UserCheck className="h-6 w-6 text-green-600" />
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
                <div className="p-3 rounded-lg bg-purple-100">
                  <UserCog className="h-6 w-6 text-purple-600" />
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
                <div className="p-3 rounded-lg bg-red-100">
                  <ShieldCheck className="h-6 w-6 text-red-600" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Report Status Overview removed */}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Officers */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Officers
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {loading ? (
                    <SkeletonRow />
                  ) : recentOfficers.length ? (
                    recentOfficers.map(officer => (
                      <OfficerRow key={officer._id} officer={officer} onOpen={() => navigate(`/admin/officer/${officer._id}`)} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No recent officers</p>
                      <p className="text-xs text-gray-400 mt-1">Officers will appear here when registered</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/admin/officers')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View All Officers
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Recent Complaints
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {loading ? (
                    <SkeletonRow />
                  ) : recentComplaintReports.length ? (
                    recentComplaintReports.map(r => (
                      <ReportRow key={r._id} r={r} onOpen={() => navigate(`/admin/reports/${r._id}`)} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ListChecks className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No recent complaints</p>
                      <p className="text-xs text-gray-400 mt-1">Complaints will appear here when submitted</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View All Complaints
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Accident Reports */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CarFront className="h-5 w-5" />
                  Recent Accidents
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {loading ? (
                    <SkeletonRow />
                  ) : recentAccidentReports.length ? (
                    recentAccidentReports.map(r => (
                      <ReportRow key={r._id} r={r} onOpen={() => navigate(`/admin/reports/${r._id}`)} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CarFront className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No recent accidents</p>
                      <p className="text-xs text-gray-400 mt-1">Accident reports will appear here when submitted</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View All Accidents
                    <ArrowRight className="h-4 w-4" />
                  </button>
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
              &copy; {new Date().getFullYear()} Police360 Administrative Command Center
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Reusable UI Components ===== */

const ReportRow = ({ r, onOpen }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getReportIcon = (reportType) => {
    if (reportType?.includes('Accident')) {
      return <CarFront className="w-3 h-3 text-orange-600" />;
    }
    return <ListChecks className="w-3 h-3 text-blue-600" />;
  };

  return (
    <button
      onClick={onOpen}
      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:text-gray-800 transition-colors">
            {getReportIcon(r.reportType)}
            <span>{r.reportNumber || '—'}</span>
          </div>
          <div className="text-xs text-gray-600 mt-1 truncate">
            {r.reporterName || 'Anonymous'} • {new Date(r.submittedAt || r.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate">
            {r.incidentLocation || 'Location not specified'}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(r.status)}`}>
          {r.status || 'Pending'}
        </span>
      </div>
    </button>
  );
};

const OfficerRow = ({ officer, onOpen }) => {
  const initials = (officer.name || '').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  
  return (
    <button
      onClick={onOpen}
      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
          {initials || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 group-hover:text-gray-800 transition-colors">
            {officer.name}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {officer.officerId} • {officer.role} • {officer.station}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          officer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {officer.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </button>
  );
};

const ActionCard = ({ icon, title, description, onClick, priority = "medium" }) => {
  const priorityClasses = {
    high: "ring-2 ring-blue-300 shadow-lg",
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
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-16 bg-gray-200 rounded-lg" />
    <div className="h-16 bg-gray-200 rounded-lg" />
    <div className="h-16 bg-gray-200 rounded-lg" />
  </div>
);

export default AdminDashboard;
