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
  Line
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
  Filter
} from "lucide-react";

export default function CriminalStatus() {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    wanted: 0,
    arrested: 0,
    inPrison: 0,
    released: 0,
    recent: 0
  });
  const navigate = useNavigate();

  // Colors for charts
  const COLORS = {
    wanted: '#EF4444',
    arrested: '#F59E0B', 
    inPrison: '#F97316',
    released: '#10B981',
    total: '#3B82F6'
  };

  const PIE_COLORS = ['#EF4444', '#F59E0B', '#F97316', '#10B981'];

  useEffect(() => {
    fetchCriminals();
  }, []);

  const fetchCriminals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/criminals');
      const data = response.data;
      setCriminals(data);
      
      // Calculate statistics
      const statsData = {
        total: data.length,
        wanted: data.filter(c => c.criminalStatus === 'wanted').length,
        arrested: data.filter(c => c.criminalStatus === 'arrested').length,
        inPrison: data.filter(c => c.criminalStatus === 'in prison').length,
        released: data.filter(c => c.criminalStatus === 'released').length,
        recent: data.filter(c => {
          const createdDate = new Date(c.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching criminals:', err);
      setError("Failed to fetch criminal data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getChartData = () => {
    const statusData = [
      { name: 'Wanted', value: stats.wanted, color: COLORS.wanted },
      { name: 'Arrested', value: stats.arrested, color: COLORS.arrested },
      { name: 'In Prison', value: stats.inPrison, color: COLORS.inPrison },
      { name: 'Released', value: stats.released, color: COLORS.released }
    ];

    // Monthly data (mock data for demonstration)
    const monthlyData = [
      { month: 'Jan', wanted: 12, arrested: 8, inPrison: 15, released: 5 },
      { month: 'Feb', wanted: 15, arrested: 10, inPrison: 18, released: 7 },
      { month: 'Mar', wanted: 18, arrested: 12, inPrison: 20, released: 9 },
      { month: 'Apr', wanted: 14, arrested: 9, inPrison: 16, released: 6 },
      { month: 'May', wanted: 16, arrested: 11, inPrison: 19, released: 8 },
      { month: 'Jun', wanted: 20, arrested: 14, inPrison: 22, released: 10 }
    ];

    return { statusData, monthlyData };
  };


  const StatCard = ({ title, value, icon, color, bgColor, trend, trendValue }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ml-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}%
              </span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading criminal status data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { statusData, monthlyData } = getChartData();

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
              <h1 className="text-4xl font-bold text-[#0B214A] mb-2">Criminal Status Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of criminal status statistics and trends</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Criminals"
            value={stats.total}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            color="bg-blue-100"
            bgColor="bg-white"
          />
          <StatCard
            title="Wanted"
            value={stats.wanted}
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            color="bg-red-100"
            bgColor="bg-white"
          />
          <StatCard
            title="Arrested"
            value={stats.arrested}
            icon={<UserMinus className="h-6 w-6 text-yellow-600" />}
            color="bg-yellow-100"
            bgColor="bg-white"
          />
          <StatCard
            title="In Prison"
            value={stats.inPrison}
            icon={<Lock className="h-6 w-6 text-orange-600" />}
            color="bg-orange-100"
            bgColor="bg-white"
          />
          <StatCard
            title="Released"
            value={stats.released}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            color="bg-green-100"
            bgColor="bg-white"
          />
          <StatCard
            title="Recent (7 days)"
            value={stats.recent}
            icon={<Activity className="h-6 w-6 text-purple-600" />}
            color="bg-purple-100"
            bgColor="bg-white"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0B214A]">Status Distribution (Bar Chart)</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart className="h-4 w-4" />
                Monthly Trends
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0B214A]">Status Distribution (Pie Chart)</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PieChart className="h-4 w-4" />
                Percentage View
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Trends Line Chart */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0B214A]">Monthly Trends</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                Last 6 Months
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Legend />
                  <Line type="monotone" dataKey="wanted" stroke={COLORS.wanted} strokeWidth={2} name="Wanted" />
                  <Line type="monotone" dataKey="arrested" stroke={COLORS.arrested} strokeWidth={2} name="Arrested" />
                  <Line type="monotone" dataKey="inPrison" stroke={COLORS.inPrison} strokeWidth={2} name="In Prison" />
                  <Line type="monotone" dataKey="released" stroke={COLORS.released} strokeWidth={2} name="Released" />
                </LineChart>
              </ResponsiveContainer>
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
              <Activity className="h-5 w-5" />
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

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Active Cases</p>
                <p className="text-2xl font-bold">{stats.wanted + stats.arrested}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">In Custody</p>
                <p className="text-2xl font-bold">{stats.inPrison}</p>
              </div>
              <Lock className="h-8 w-8 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Cases Closed</p>
                <p className="text-2xl font-bold">{stats.released}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
