import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import axiosInstance from "../../utils/axiosInstance";
import { getMediaUrl } from '../../utils/mediaUrl';
import { 
  ShieldCheck, 
  UserX, 
  UserMinus, 
  Lock, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  MapPin
} from "lucide-react";

export default function CriminalManage() {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    wanted: 0,
    arrested: 0,
    inPrison: 0,
    released: 0
  });
  const navigate = useNavigate();

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
        released: data.filter(c => c.criminalStatus === 'released').length
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching criminals:', err);
      setError("Failed to fetch criminal data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCriminal = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axiosInstance.delete(`/criminals/${id}`);
        fetchCriminals(); // Refresh the list
        alert('Criminal record deleted successfully');
      } catch (err) {
        console.error('Error deleting criminal:', err);
        alert('Failed to delete criminal record');
      }
    }
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      'wanted': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <AlertTriangle className="h-4 w-4" /> 
      },
      'arrested': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <UserMinus className="h-4 w-4" /> 
      },
      'in prison': { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: <Lock className="h-4 w-4" /> 
      },
      'released': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <CheckCircle className="h-4 w-4" /> 
      }
    };

    const config = statusConfig[status] || statusConfig['wanted'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const formatStatusDate = (criminal) => {
    try {
      if (!criminal || !criminal.criminalStatus) return null;
      if (criminal.criminalStatus === 'arrested' && criminal.arrestDate) {
        const d = new Date(criminal.arrestDate);
        return `Arrested: ${d.toLocaleDateString()}`;
      }
      if (criminal.criminalStatus === 'in prison') {
        // Prefer explicit prisonDays display when available
        if (typeof criminal.prisonDays === 'number' && !Number.isNaN(criminal.prisonDays)) {
          return `In Prison: ${criminal.prisonDays} days`;
        }
        // If there's a releaseDate stored, show 'Release:' otherwise show 'In Prison since' using arrestDate if available
        if (criminal.releaseDate) {
          const d = new Date(criminal.releaseDate);
          return `Release: ${d.toLocaleDateString()}`;
        }
        if (criminal.arrestDate) {
          const d = new Date(criminal.arrestDate);
          return `In Prison since ${d.toLocaleDateString()}`;
        }
        return null;
      }
      if (criminal.criminalStatus === 'released' && criminal.releaseDate) {
        const d = new Date(criminal.releaseDate);
        return `Released: ${d.toLocaleDateString()}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const filteredCriminals = criminals.filter(criminal => {
    const matchesSearch = criminal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criminal.criminalId?.includes(searchTerm) ||
                         criminal.nic?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || criminal.criminalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, count, icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
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
            <p className="text-gray-600">Loading criminal data...</p>
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
          <div>
            <h1 className="text-4xl font-bold text-[#0B214A] mb-2">Criminal Management</h1>
            <p className="text-gray-600">Manage and monitor criminal records and status</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => navigate('/CriminalManage/Criminal')}
              className="flex items-center gap-2 bg-[#0B214A] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add New Criminal
            </button>

            <button
              onClick={() => navigate('/officer/officerDashboard')}
              className="flex items-center gap-2 mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Criminals"
            count={stats.total}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            color="bg-blue-100"
            bgColor="bg-white"
          />
          <StatCard
            title="Wanted"
            count={stats.wanted}
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            color="bg-red-100"
            bgColor="bg-white"
          />
          <StatCard
            title="Arrested"
            count={stats.arrested}
            icon={<UserMinus className="h-6 w-6 text-yellow-600" />}
            color="bg-yellow-100"
            bgColor="bg-white"
          />
          <StatCard
            title="In Prison"
            count={stats.inPrison}
            icon={<Lock className="h-6 w-6 text-orange-600" />}
            color="bg-orange-100"
            bgColor="bg-white"
          />
          <StatCard
            title="Released"
            count={stats.released}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            color="bg-green-100"
            bgColor="bg-white"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, criminal ID, or NIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="wanted">Wanted</option>
                <option value="arrested">Arrested</option>
                <option value="in prison">In Prison</option>
                <option value="released">Released</option>
              </select>
              <button
                onClick={fetchCriminals}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Criminals Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#0B214A]">
              Criminal Records ({filteredCriminals.length})
            </h2>
          </div>
          
          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchCriminals}
                className="px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredCriminals.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">👤</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Criminals Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No criminals match your search criteria" 
                  : "No criminal records have been created yet"}
              </p>
              <button
                onClick={() => navigate('/CriminalManage/Criminal')}
                className="px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700"
              >
                Add First Criminal
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criminal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID & NIC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCriminals.map((criminal) => (
                    <tr key={criminal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {criminal.photo ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={getMediaUrl(criminal.photo)}
                                alt={criminal.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserX className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {criminal.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {criminal.aliases || "No aliases"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-mono">#{criminal.criminalId || "N/A"}</div>
                          <div className="text-gray-500">{criminal.nic || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div>
                          {getStatusBadge(criminal.criminalStatus)}
                          {criminal.rewardPrice && criminal.criminalStatus === 'wanted' && (
                            <div className="text-xs text-red-600 mt-1">
                              Reward: LKR {criminal.rewardPrice.toLocaleString()}
                            </div>
                          )}
                          {(() => {
                            const statusLine = formatStatusDate(criminal);
                            return statusLine ? (
                              <div className="text-xs text-gray-500 mt-1">{statusLine}</div>
                            ) : null;
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {criminal.address || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {criminal.createdAt ? new Date(criminal.createdAt).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/CriminalManage/CriminalProfile?id=${criminal._id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/CriminalManage/Criminal?edit=${criminal._id}`)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCriminal(criminal._id, criminal.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#0B214A] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/CriminalManage/Criminal')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New Criminal
              </button>
              <button
                onClick={() => setStatusFilter('wanted')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                View Wanted List
              </button>
              <button
                onClick={() => setStatusFilter('in prison')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
              >
                <Lock className="h-4 w-4" />
                Prison Records
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#0B214A] mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Records:</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Cases:</span>
                <span className="font-semibold text-red-600">{stats.wanted + stats.arrested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Custody:</span>
                <span className="font-semibold text-orange-600">{stats.inPrison}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Released:</span>
                <span className="font-semibold text-green-600">{stats.released}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#0B214A] mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Database Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">API Services Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">File Storage Active</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">System Performance: Good</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




