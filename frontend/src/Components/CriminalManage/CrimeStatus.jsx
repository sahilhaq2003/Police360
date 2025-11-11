import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import axiosInstance from "../../utils/axiosInstance";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  Users, 
  AlertTriangle, 
  UserMinus, 
  Lock, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Download,
  Filter,
  Shield,
  Clock,
  Target,
  FileText,
  Eye,
  Edit
} from "lucide-react";

export default function CrimeStatus() {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [crimeStats, setCrimeStats] = useState({
    totalCrimes: 0,
    totalCriminals: 0,
    crimesByType: {},
    crimesByMonth: [],
    mostCommonCrimes: [],
    crimeSeverity: {
      high: 0,
      medium: 0,
      low: 0
    }
  });
  const navigate = useNavigate();

  // Colors for charts
  const COLORS = {
    high: '#EF4444',      // Red for high severity
    medium: '#F59E0B',    // Yellow for medium severity
    low: '#10B981',       // Green for low severity
    total: '#3B82F6',     // Blue for totals
    wanted: '#EF4444',
    arrested: '#F59E0B',
    inPrison: '#F97316',
    released: '#10B981'
  };

  const CRIME_COLORS = [
    '#EF4444', '#F59E0B', '#F97316', '#10B981', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#EF4444'
  ];

  useEffect(() => {
    fetchCriminals();
  }, []);

  const fetchCriminals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/criminals');
      const data = response.data;
      setCriminals(data);
      
      // Calculate crime statistics
      calculateCrimeStats(data);
    } catch (err) {
      console.error('Error fetching criminals:', err);
      setError("Failed to fetch criminal data");
    } finally {
      setLoading(false);
    }
  };

  const calculateCrimeStats = (criminalData) => {
    const crimesByType = {};
    const crimesByMonth = {};
    const mostCommonCrimes = [];
    let totalCrimes = 0;
    let crimeSeverity = { high: 0, medium: 0, low: 0 };

    criminalData.forEach(criminal => {
      if (criminal.arrests && criminal.arrests.length > 0) {
        criminal.arrests.forEach(arrest => {
          totalCrimes++;
          
          // Count crimes by type
          const charge = arrest.charge || 'Unknown Crime';
          crimesByType[charge] = (crimesByType[charge] || 0) + 1;
          
          // Count crimes by month
          if (arrest.date) {
            const date = new Date(arrest.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            crimesByMonth[monthKey] = (crimesByMonth[monthKey] || 0) + 1;
          }
          
          // Determine crime severity based on term
          const term = arrest.term || '';
          if (term.includes('year') && parseInt(term) >= 5) {
            crimeSeverity.high++;
          } else if (term.includes('year') || term.includes('month') && parseInt(term) >= 6) {
            crimeSeverity.medium++;
          } else {
            crimeSeverity.low++;
          }
        });
      }
    });

    // Convert to arrays for charts
    const crimesByTypeArray = Object.entries(crimesByType)
      .map(([crime, count]) => ({ name: crime, value: count, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 crimes

    const crimesByMonthArray = Object.entries(crimesByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        crimes: count
      }));

    setCrimeStats({
      totalCrimes,
      totalCriminals: criminalData.length,
      crimesByType: crimesByTypeArray,
      crimesByMonth: crimesByMonthArray,
      mostCommonCrimes: crimesByTypeArray.slice(0, 5),
      crimeSeverity
    });
  };

  const getCriminalCrimeSummary = (criminal) => {
    if (!criminal.arrests || criminal.arrests.length === 0) {
      return { totalCrimes: 0, crimes: [], severity: 'None' };
    }

    const crimes = criminal.arrests.map(arrest => ({
      charge: arrest.charge || 'Unknown',
      date: arrest.date,
      term: arrest.term || 'Unknown',
      institution: arrest.institution || 'Unknown'
    }));

    const totalCrimes = crimes.length;
    const hasHighSeverity = crimes.some(crime => 
      crime.term.includes('year') && parseInt(crime.term) >= 5
    );
    const hasMediumSeverity = crimes.some(crime => 
      crime.term.includes('year') || (crime.term.includes('month') && parseInt(crime.term) >= 6)
    );

    let severity = 'Low';
    if (hasHighSeverity) severity = 'High';
    else if (hasMediumSeverity) severity = 'Medium';

    return { totalCrimes, crimes, severity };
  };

  const StatCard = ({ title, value, icon, color, bgColor, subtitle }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const CrimeCard = ({ criminal, onClick }) => {
    const summary = getCriminalCrimeSummary(criminal);
    const getSeverityColor = (severity) => {
      switch(severity) {
        case 'High': return 'bg-red-100 text-red-800 border-red-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div 
        className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-blue-500"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{criminal.name || 'Unknown'}</h3>
            <p className="text-sm text-gray-600">ID: #{criminal.criminalId || 'N/A'}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(summary.severity)}`}>
            {summary.severity} Risk
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Total Crimes:</span>
            <p className="text-lg font-bold text-blue-600">{summary.totalCrimes}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span>
            <p className="text-gray-800 capitalize">{criminal.criminalStatus || 'Unknown'}</p>
          </div>
        </div>
        
        {summary.crimes.length > 0 && (
          <div className="mt-3">
            <span className="font-medium text-gray-600 text-sm">Recent Crime:</span>
            <p className="text-sm text-gray-700 truncate">
              {summary.crimes[0].charge} ({summary.crimes[0].term})
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading crime status data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/CriminalManage/CriminalManage')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Criminal Management
            </button>
            <div>
              <h1 className="text-4xl font-bold text-[#0B214A] mb-2">Crime Status Dashboard</h1>
              <p className="text-gray-600">Comprehensive analysis of crimes and criminal activities</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="week">Last Week</option>
            </select>
            <button
              onClick={fetchCriminals}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B214A] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Crimes"
            value={crimeStats.totalCrimes}
            icon={<Target className="h-6 w-6 text-blue-600" />}
            color="bg-blue-100"
            bgColor="bg-white"
            subtitle="All recorded crimes"
          />
          <StatCard
            title="Total Criminals"
            value={crimeStats.totalCriminals}
            icon={<Users className="h-6 w-6 text-purple-600" />}
            color="bg-purple-100"
            bgColor="bg-white"
            subtitle="Active criminal records"
          />
          <StatCard
            title="High Risk Crimes"
            value={crimeStats.crimeSeverity.high}
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            color="bg-red-100"
            bgColor="bg-white"
            subtitle="5+ years sentences"
          />
          <StatCard
            title="Crime Types"
            value={crimeStats.crimesByType.length}
            icon={<FileText className="h-6 w-6 text-green-600" />}
            color="bg-green-100"
            bgColor="bg-white"
            subtitle="Different crime categories"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Crime Types Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0B214A]">Crime Types Distribution</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PieChart className="h-4 w-4" />
                Top Crimes
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={crimeStats.crimesByType.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {crimeStats.crimesByType.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CRIME_COLORS[index % CRIME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crime Severity Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0B214A]">Crime Severity Analysis</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart className="h-4 w-4" />
                Risk Levels
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'High Risk', value: crimeStats.crimeSeverity.high, color: COLORS.high },
                  { name: 'Medium Risk', value: crimeStats.crimeSeverity.medium, color: COLORS.medium },
                  { name: 'Low Risk', value: crimeStats.crimeSeverity.low, color: COLORS.low }
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {[
                      { name: 'High Risk', value: crimeStats.crimeSeverity.high, color: COLORS.high },
                      { name: 'Medium Risk', value: crimeStats.crimeSeverity.medium, color: COLORS.medium },
                      { name: 'Low Risk', value: crimeStats.crimeSeverity.low, color: COLORS.low }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Crime Trends Over Time */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0B214A]">Crime Trends Over Time</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                Monthly Analysis
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={crimeStats.crimesByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="crimes" 
                    stroke={COLORS.total} 
                    fill={COLORS.total}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Criminals by Crime Count */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0B214A]">Top Criminals by Crime Count</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Most Active Criminals
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {criminals
                .filter(criminal => criminal.arrests && criminal.arrests.length > 0)
                .sort((a, b) => (b.arrests?.length || 0) - (a.arrests?.length || 0))
                .slice(0, 6)
                .map((criminal, index) => (
                  <CrimeCard 
                    key={criminal._id} 
                    criminal={criminal}
                    onClick={() => setSelectedCriminal(criminal)}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Crime Summary */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-[#0B214A] mb-6">Crime Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3">Most Common Crimes</h3>
                <div className="space-y-2">
                  {crimeStats.mostCommonCrimes.map((crime, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 truncate">{crime.name}</span>
                      <span className="text-sm font-semibold text-blue-900">{crime.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-3">High Risk Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-700">High Risk Crimes</span>
                    <span className="text-sm font-semibold text-red-900">{crimeStats.crimeSeverity.high}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-700">Percentage</span>
                    <span className="text-sm font-semibold text-red-900">
                      {crimeStats.totalCrimes > 0 ? Math.round((crimeStats.crimeSeverity.high / crimeStats.totalCrimes) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">System Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Avg Crimes/Criminal</span>
                    <span className="text-sm font-semibold text-green-900">
                      {crimeStats.totalCriminals > 0 ? Math.round(crimeStats.totalCrimes / crimeStats.totalCriminals * 10) / 10 : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Active Cases</span>
                    <span className="text-sm font-semibold text-green-900">
                      {criminals.filter(c => c.criminalStatus === 'wanted' || c.criminalStatus === 'arrested').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#0B214A] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/CriminalManage/Criminal')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B214A] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="h-5 w-5" />
              Add New Criminal
            </button>
            <button
              onClick={() => navigate('/CriminalManage/CriminalManage')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye className="h-5 w-5" />
              View All Records
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
