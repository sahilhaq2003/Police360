import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ServerCog, 
  ShieldCheck, 
  Users2, 
  CalendarDays, 
  FileText, 
  CarFront, 
  ClipboardList, 
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const ItOfficerDashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({ activeCount: 0, officer: 0, it: 0, admin: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch officer KPIs (shows counts incl. IT officers)
        const offRes = await axiosInstance.get('/officers', { params: { page: 1, pageSize: 1 } });
        const k = offRes.data?.kpis || { activeCount: 0, officer: 0, it: 0, admin: 0 };
        setKpis(k);

        // Removed: IT dashboard no longer shows Requests
      } catch (e) {
        // silent fail, global interceptor handles auth
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const quickStats = useMemo(() => ([
    { 
      label: 'Active Personnel', 
      value: kpis.activeCount, 
      icon: <ShieldCheck className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Field Officers', 
      value: kpis.officer, 
      icon: <Users2 className="h-6 w-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'IT Specialists', 
      value: kpis.it, 
      icon: <ServerCog className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Command Staff', 
      value: kpis.admin, 
      icon: <ShieldCheck className="h-6 w-6" />,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
  ]), [kpis]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <PoliceHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <ServerCog className="h-8 w-8" />
            </div>
          <div>
              <h1 className="text-3xl md:text-4xl font-bold">IT Command Center</h1>
              <p className="text-blue-100 mt-2">Police Technology Operations Dashboard</p>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Systems Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>All Services Operational</span>
            </div>
          </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, idx) => (
            <div key={idx} className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.textColor}>{stat.icon}</div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Command Operations
                </h2>
                <p className="text-blue-100 text-sm mt-1">Access critical police systems and management tools</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ActionCard
                    icon={<Users2 className="h-10 w-10" />}
                    title="Personnel Management"
                    description="View and manage officer records"
                    onClick={() => navigate('/admin/officers')}
                    color="blue"
                  />
                  <ActionCard
                    icon={<CalendarDays className="h-10 w-10" />}
                    title="Duty Schedules"
                    description="Manage officer shift assignments"
                    onClick={() => navigate('/itOfficer/schedules')}
                    color="green"
                  />
                  <ActionCard
                    icon={<CarFront className="h-10 w-10" />}
                    title="Traffic Incidents"
                    description="Monitor accident reports and investigations"
                    onClick={() => navigate('/accidents')}
                    color="orange"
                  />
                  <ActionCard
                    icon={<FileText className="h-10 w-10" />}
                    title="Criminal Complaints"
                    description="Review and process complaint reports"
                    onClick={() => navigate('/it/cases')}
                    color="purple"
                  />
                  <ActionCard
                    icon={<ClipboardList className="h-10 w-10" />}
                    title="Case Management"
                    description="Track active investigations and cases"
                    onClick={() => navigate('/it/view-cases')}
                    color="red"
                  />
                  <ActionCard
                    icon={<AlertTriangle className="h-10 w-10" />}
                    title="System Alerts"
                    description="Monitor system status and alerts"
                    onClick={() => navigate('/it/alerts')}
                    color="yellow"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  System Status
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <StatusItem label="Database" status="online" />
                <StatusItem label="Authentication" status="online" />
                <StatusItem label="File Storage" status="online" />
                <StatusItem label="Email Service" status="online" />
                <StatusItem label="Backup System" status="online" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Today's Activity
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Reports</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Cases</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Scheduled Shifts</span>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recent Accidents</span>
                  <span className="font-semibold text-gray-900">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">System Logins</span>
                  <span className="font-semibold text-gray-900">156</span>
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
              &copy; {new Date().getFullYear()} Police360 IT Command Center - Secure Operations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ icon, title, description, onClick, color = "blue" }) => {
  const colorClasses = {
    blue: "hover:bg-blue-50 hover:border-blue-200 text-blue-600",
    green: "hover:bg-green-50 hover:border-green-200 text-green-600",
    orange: "hover:bg-orange-50 hover:border-orange-200 text-orange-600",
    purple: "hover:bg-purple-50 hover:border-purple-200 text-purple-600",
    red: "hover:bg-red-50 hover:border-red-200 text-red-600",
    yellow: "hover:bg-yellow-50 hover:border-yellow-200 text-yellow-600"
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-8 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200 group ${colorClasses[color]}`}
    >
      <div className="flex items-start gap-5">
        <div className="p-4 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors mb-3">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

// Status Item Component
const StatusItem = ({ label, status }) => {
  const isOnline = status === "online";
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default ItOfficerDashboard;


