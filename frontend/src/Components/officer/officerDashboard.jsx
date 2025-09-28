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
        const [reportsRes, accRes, caseRes] = await Promise.all([
          axiosInstance.get('/reporting/my').catch(err => {
            console.warn('Reports API not available:', err.message);
            return { data: [] };
          }),
          axiosInstance.get('/accidents', { 
            params: { 
              page: 1, 
              limit: 50, 
              assignedToMe: 'true' 
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
          })
        ]);

        // Process reports data
        const reportsData = reportsRes.data || [];
        setReports(reportsData);
        
        const stat = { assigned: 0, inProgress: 0, completed: 0 };
        reportsData.forEach(r => {
          if (r.status === 'In Progress') stat.inProgress++;
          else if (r.status === 'Completed') stat.completed++;
          else stat.assigned++;
        });
        setStats(stat);

        // Process accidents data
        const accidentsData = accRes.data?.items || accRes.data || [];
        console.log('Fetched accidents:', accidentsData.length);
        setMyAccidents(accidentsData);

        // Process cases data
        const casesData = caseRes.data?.data || caseRes.data || [];
        console.log('Fetched cases:', casesData.length);
        setMyCases(casesData);

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
      label: 'Assigned Cases', 
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
        
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Field Operations */}
           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 <BarChart3 className="h-5 w-5" />
                 Field Operations
               </h2>
               <p className="text-blue-100 text-xs mt-1">Access operational tools</p>
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
           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
             <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-3">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <CarFront className="h-5 w-5" />
                 Assigned Accidents
               </h3>
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
                       onClick={() => navigate('/officer/assign-accidents')}
                     >
                       <div className="text-sm font-medium text-gray-900">{a.trackingId}</div>
                       <div className="text-xs text-gray-600 mt-1">{a.accidentType?.replaceAll('_', ' ')}</div>
                       <div className="text-xs text-gray-500 mt-1">{a.status} • {a.locationText}</div>
                       {a.assignedOfficer && (
                         <div className="text-xs text-blue-600 mt-1">
                           Assigned to: {a.assignedOfficer.name}
                         </div>
                       )}
                     </div>
                   ))
                 )}
               </div>
             </div>
           </div>

           {/* Assigned Complaints */}
           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
             <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <AlertTriangle className="h-5 w-5" />
                 Assigned Complaints
               </h3>
             </div>
             <div className="p-4">
               <div className="space-y-3">
                 {loading ? (
                   <SkeletonRow />
                 ) : myCases.length === 0 ? (
                   <div className="text-center py-4">
                     <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                     <p className="text-sm text-gray-600">No complaints assigned</p>
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
                       onClick={() => navigate(`/cases/${c._id}`)}
                     >
                       <div className="text-sm font-medium text-gray-900">{c.complainant?.name}</div>
                       <div className="text-xs text-gray-600 mt-1">{c.complaintDetails?.typeOfComplaint}</div>
                       <div className="text-xs text-gray-500 mt-1">{c.status} • {c.complaintDetails?.location}</div>
                       <div className="text-xs text-blue-600 mt-1">
                         {new Date(c.createdAt).toLocaleDateString()}
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
             <ShieldCheck className="h-4 w-4 text-blue-600" />
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
      className={`w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200 group ${colorClasses[color]}`}
    >
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
          {icon}
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
