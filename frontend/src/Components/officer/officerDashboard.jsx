import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, 
  ClipboardCheck, 
  BookMarked, 
  CalendarDays, 
  ShieldCheck, 
  LogOut,
  User,
  CarFront,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Users,
  Badge
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { getMediaUrl } from '../../utils/mediaUrl';
import PoliceHeader from '../../Components/PoliceHeader/PoliceHeader';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [myAccidents, setMyAccidents] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const myId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        console.log('Fetching data for officer ID:', myId);
        
        // Fetch all data in parallel
        const [reportsRes, accRes, caseRes, itCaseRes] = await Promise.all([
          axiosInstance.get('/reporting/my').catch(err => {
            console.warn('Reports API not available:', err.message);
            return { data: [] };
          }),
          axiosInstance.get('/accidents', { 
            params: { 
              assignedOfficer: myId,
              page: 1, 
              limit: 50
            } 
          }).catch(err => {
            console.warn('Accidents API error:', err.message);
            return { data: { items: [] } };
          }),
          axiosInstance.get('/cases', { 
            params: { 
              assignedOfficer: myId,
              page: 1,
              pageSize: 50
            } 
          }).catch(err => {
            console.warn('Cases API error:', err.message);
            return { data: { data: [] } };
          }),
          axiosInstance.get('/it-cases', { 
            params: { 
              assignedOfficer: myId,
              page: 1,
              pageSize: 50
            } 
          }).catch(err => {
            console.warn('IT Cases API error:', err.message);
            return { data: { data: [] } };
          })
        ]);

        // Process reports data
        const reportsData = reportsRes.data || [];
        setReports(reportsData);

        // Process accidents data
        const accidentsData = accRes.data?.items || accRes.data || [];
        console.log('Fetched accidents:', accidentsData.length);
        console.log('Accidents assigned to officer:', accidentsData.map(a => ({
          id: a._id,
          trackingId: a.trackingId,
          assignedTo: a.assignedOfficer?._id || a.assignedOfficer,
          status: a.status
        })));
        setMyAccidents(accidentsData);

        // Process cases data - combine regular cases and IT cases
        const regularCases = caseRes.data?.data || caseRes.data || [];
        const itCases = itCaseRes.data?.data || itCaseRes.data || [];
        
        // Mark IT cases with a flag for differentiation
        const markedITCases = itCases.map(c => ({ ...c, isITCase: true }));
        const markedRegularCases = regularCases.map(c => ({ ...c, isITCase: false }));
        
        const allCases = [...markedITCases, ...markedRegularCases];
        console.log('Fetched cases:', regularCases.length, 'regular,', itCases.length, 'IT cases');
        setMyCases(allCases);

        // Calculate stats from all cases and accidents
        const stat = { assigned: 0, inProgress: 0, completed: 0 };
        
        // Count cases
        allCases.forEach(c => {
          const status = c.status?.toUpperCase();
          if (status === 'IN_PROGRESS' || status === 'IN PROGRESS') {
            stat.inProgress++;
          } else if (status === 'CLOSED' || status === 'COMPLETED') {
            stat.completed++;
          } else {
            stat.assigned++;
          }
        });

        // Count accidents
        accidentsData.forEach(a => {
          const status = a.status?.toUpperCase();
          if (status === 'UNDER_INVESTIGATION') {
            stat.inProgress++;
          } else if (status === 'RESOLVED' || status === 'CLOSED') {
            stat.completed++;
          } else {
            stat.assigned++;
          }
        });

        setStats(stat);

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        // Set empty arrays on error to show empty states
        setReports([]);
        setMyAccidents([]);
        setMyCases([]);
        setStats({ assigned: 0, inProgress: 0, completed: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (!id) return;
        const res = await axiosInstance.get(`/officers/${id}`);
        setMe(res.data || null);
      } catch (err) { console.error('Failed to load officer:', err); }
    };
    loadMe();
  }, []);

  const quickStats = useMemo(() => ([
    { 
      label: 'Assigned Items', 
      value: stats.assigned, 
      icon: <ClipboardCheck className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress, 
      icon: <BookMarked className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    { 
      label: 'Completed', 
      value: stats.completed, 
      icon: <FileText className="h-6 w-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
  ]), [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <PoliceHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              {me?.photo ? (
                <img src={getMediaUrl(me.photo)} alt={me.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <ShieldCheck className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Officer Command Center</h1>
              <p className="text-blue-100 mt-2">Welcome back, {me?.name || 'Officer'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Badge className="h-4 w-4" />
                  {me?.officerId || 'ID: N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {me?.station || 'Station: N/A'}
                </span>
              </div>
            </div>
          </div>
        
          {/* Status Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>On Duty</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Active Cases: {stats.assigned + stats.inProgress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, idx) => (
            <div key={idx} className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <div className="text-gray-700">{stat.icon}</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Field Operations */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Field Operations
              </h2>
              <p className="text-gray-300 text-xs mt-1">Access operational tools</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <ActionCard
                  icon={<User className="h-5 w-5" />}
                  title="Suspect Management"
                  description="Manage suspect records"
                  onClick={() => navigate('/SuspectManage/SuspectManage')}
                  color="blue"
                />
                <ActionCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Criminal Records"
                  description="Manage case files"
                  onClick={() => navigate('/CriminalManage/CriminalManage')}
                  color="red"
                />
                <ActionCard
                  icon={<ClipboardCheck className="h-5 w-5" />}
                  title="Assigned Cases"
                  description="View complaint reports"
                  onClick={() => navigate('/officer/reports')}
                  color="green"
                />
                <ActionCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="Duty Schedule"
                  description="Check shift assignments"
                  onClick={() => navigate('/officer/calendar')}
                  color="purple"
                />
                <ActionCard
                  icon={<FileText className="h-5 w-5" />}
                  title="Request Chief"
                  description="Submit requests"
                  onClick={() => navigate('/officer/request')}
                  color="orange"
                />
                <ActionCard
                  icon={<CarFront className="h-5 w-5" />}
                  title="Traffic Incidents"
                  description="Manage investigations"
                  onClick={() => navigate('/officer/assign-accidents')}
                  color="yellow"
                />
              </div>
            </div>
          </div>

          {/* Assigned Accidents */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CarFront className="h-5 w-5" />
                Assigned Accidents
              </h3>
              <p className="text-gray-300 text-xs mt-1">Traffic incident investigations</p>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {loading ? (
                  <SkeletonRow />
                ) : myAccidents.length === 0 ? (
                  <div className="text-center py-4">
                    <CarFront className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No accidents assigned</p>
                    <button 
                      onClick={() => navigate('/officer/assign-accidents')}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View all accidents
                    </button>
                  </div>
                ) : (
                  myAccidents.slice(0, 3).map((a) => (
                    <div
                      key={a._id}
                      className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/accidents/${a._id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-medium text-gray-900">{a.trackingId || 'N/A'}</div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          a.status === 'UNDER_INVESTIGATION' ? 'bg-orange-100 text-orange-700' :
                          a.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                          a.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {a.status?.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {a.accidentType?.replaceAll('_', ' ') || 'Unknown Type'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {a.locationText || 'Location not specified'}
                      </div>
                      {a.severity && (
                        <div className="text-xs mt-1">
                          <span className={`px-1.5 py-0.5 rounded ${
                            a.severity === 'FATAL' || a.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            a.severity === 'SERIOUS' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {a.severity}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Assigned Cases */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Assigned Cases
              </h3>
              <p className="text-gray-300 text-xs mt-1">Criminal case investigations</p>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {loading ? (
                  <SkeletonRow />
                ) : myCases.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No cases assigned</p>
                    <button
                      onClick={() => navigate('/officer/cases')}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View all cases
                    </button>
                  </div>
                ) : (
                  myCases.slice(0, 3).map(c => (
                    <div
                      key={c._id}
                      className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(c.isITCase ? `/it/case-details/${c._id}` : `/cases/${c._id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-medium text-gray-900">{c.complainant?.name}</div>
                        {c.isITCase && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">IT Case</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{c.complaintDetails?.typeOfComplaint}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {c.status} • {c.complaintDetails?.location}
                        {c.isITCase && c.itOfficerDetails?.urgencyLevel && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                            c.itOfficerDetails.urgencyLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                            c.itOfficerDetails.urgencyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {c.itOfficerDetails.urgencyLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {new Date(c.createdAt).toLocaleDateString()}
                        {c.caseId && <span className="ml-2 text-gray-500">#{c.caseId}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <ShieldCheck className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Police360 Officer Command Center - Field Operations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ icon, title, description, onClick, color = "blue" }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md hover:bg-gray-50 transition-all duration-200 group"
    >
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
          <div className="text-gray-700">{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm text-gray-900 group-hover:text-gray-800 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

const SkeletonRow = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-10 bg-gray-200 rounded-lg" />
    <div className="h-10 bg-gray-200 rounded-lg" />
  </div>
);

export default OfficerDashboard;