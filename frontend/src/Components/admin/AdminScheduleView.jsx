import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import AdminHeader from '../AdminHeader/AdminHeader';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  RefreshCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';

const AdminScheduleView = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [officerFilter, setOfficerFilter] = useState('All');
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [schedulesRes, officersRes] = await Promise.all([
        axiosInstance.get('/schedules', {
          params: {
            page: 1,
            pageSize: 200,
          },
        }),
        axiosInstance.get('/officers', {
          params: {
            page: 1,
            pageSize: 100,
            role: 'All',
            status: 'All',
            station: 'All',
          },
        }),
      ]);

      const schedulesData = schedulesRes.data?.data || [];
      const officersData = officersRes.data?.data || [];

      // Sort schedules by creation date (newest first)
      const sortedSchedules = schedulesData.sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );

      setSchedules(sortedSchedules);
      setOfficers(officersData);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = !searchTerm || 
      schedule.officer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.officer?.officerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || schedule.remark === statusFilter;
    
    const matchesDate = !dateFilter || 
      new Date(schedule.date).toISOString().split('T')[0] === dateFilter;
    
    const matchesOfficer = officerFilter === 'All' || 
      schedule.officer?._id === officerFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesOfficer;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (shift) => {
    if (!shift) return 'N/A';
    return shift.replace('-', ' - ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B214A] flex items-center gap-3">
              <CalendarDays className="w-8 h-8" />
              Duty Schedules
            </h1>
            <p className="text-sm text-[#5A6B85] mt-1">
              View and search through all officer duty schedules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B214A] text-white hover:bg-[#123974] transition"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E4E9F2] text-[#0B214A] hover:bg-[#F6F8FC] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B85]" />
              <input
                type="text"
                placeholder="Search by officer, location, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B85]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B85]" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-transparent"
              />
            </div>

            {/* Officer Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B85]" />
              <select
                value={officerFilter}
                onChange={(e) => setOfficerFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#0B214A] focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Officers</option>
                {officers.map((officer) => (
                  <option key={officer._id} value={officer._id}>
                    {officer.name} ({officer.officerId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#5A6B85]">Total Schedules</div>
                <div className="text-2xl font-bold mt-1">{schedules.length}</div>
              </div>
              <CalendarDays className="w-8 h-8 text-[#0B214A]" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#5A6B85]">Pending</div>
                <div className="text-2xl font-bold mt-1">
                  {schedules.filter(s => s.remark === 'pending').length}
                </div>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#5A6B85]">Accepted</div>
                <div className="text-2xl font-bold mt-1">
                  {schedules.filter(s => s.remark === 'accepted').length}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#5A6B85]">Completed</div>
                <div className="text-2xl font-bold mt-1">
                  {schedules.filter(s => s.remark === 'completed').length}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Schedules List */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow">
          <div className="p-6 border-b border-[#E4E9F2]">
            <h3 className="text-lg font-semibold">
              Schedule Details ({filteredSchedules.length} found)
            </h3>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-[#EEF2F7] rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredSchedules.length > 0 ? (
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <div
                    key={schedule._id}
                    className="border border-[#E4E9F2] rounded-lg p-4 hover:bg-[#F6F8FC] transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#5A6B85]" />
                            <span className="font-medium">
                              {schedule.officer?.name || 'Unknown Officer'}
                            </span>
                            <span className="text-sm text-[#5A6B85]">
                              ({schedule.officer?.officerId || 'N/A'})
                            </span>
                          </div>
                          <span className="text-sm text-[#5A6B85]">
                            {schedule.officer?.role || 'Officer'} • {schedule.officer?.station || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#5A6B85]" />
                            <span className="text-[#5A6B85]">Date:</span>
                            <span className="font-medium">{formatDate(schedule.date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#5A6B85]" />
                            <span className="text-[#5A6B85]">Shift:</span>
                            <span className="font-medium">{formatTime(schedule.shift)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#5A6B85]" />
                            <span className="text-[#5A6B85]">Location:</span>
                            <span className="font-medium">{schedule.location || 'Not specified'}</span>
                          </div>
                        </div>
                        
                        {schedule.notes && (
                          <div className="mt-3 p-3 bg-[#F6F8FC] rounded-lg">
                            <div className="text-sm text-[#5A6B85] mb-1">Notes:</div>
                            <div className="text-sm">{schedule.notes}</div>
                          </div>
                        )}
                        
                        {schedule.declineReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <div className="text-sm text-red-700 mb-1">Decline Reason:</div>
                            <div className="text-sm text-red-600">{schedule.declineReason}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            schedule.remark
                          )}`}
                        >
                          {getStatusIcon(schedule.remark)}
                          {schedule.remark?.charAt(0).toUpperCase() + schedule.remark?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 text-[#5A6B85] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#0B214A] mb-2">No schedules found</h3>
                <p className="text-sm text-[#5A6B85]">
                  {searchTerm || statusFilter !== 'All' || dateFilter || officerFilter !== 'All'
                    ? 'Try adjusting your search criteria'
                    : 'No duty schedules have been created yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminScheduleView;
