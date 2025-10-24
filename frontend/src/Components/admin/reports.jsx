import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import AdminHeader from '../AdminHeader/AdminHeader';
import {
  FileText,
  Search,
  Filter,
  Eye,
  RefreshCcw,
  Download,
  ArrowLeft,
  CheckCircle2,
  Clock4,
  AlertCircle,
  Ban,
  CarFront,
  ListChecks,
  CalendarDays,
  User,
  MapPin,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

const Reports = () => {
  const navigate = useNavigate();

  // State management
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalReports: 0,
    todayReports: 0,
    byStatus: { Pending: 0, 'Under Review': 0, 'In Progress': 0, Completed: 0, Rejected: 0 },
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    loadReports();
  }, [page, pageSize, sortKey, sortDir]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [reportsRes, statsRes] = await Promise.all([
        axiosInstance.get('/reports', {
          params: {
            page,
            limit: pageSize,
            search: searchTerm,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            reportType: typeFilter !== 'All' ? typeFilter : undefined,
            sort: `${sortKey}:${sortDir}`,
          },
        }),
        axiosInstance.get('/reports/stats'),
      ]);

      const reportsData = reportsRes.data?.data?.docs || reportsRes.data?.data || [];
      setReports(reportsData);

      // Process stats
      const rawStats = statsRes.data?.data || {};
      const mapStatus = { Pending: 0, 'Under Review': 0, 'In Progress': 0, Completed: 0, Rejected: 0 };
      (rawStats.statusStats || []).forEach(s => { mapStatus[s._id] = s.count; });
      setStats({
        totalReports: rawStats.totalReports || 0,
        todayReports: rawStats.todayReports || 0,
        byStatus: mapStatus,
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        loadReports();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.reportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.incidentLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesType = typeFilter === 'All' || report.reportType === typeFilter;
    
    const matchesDate = !dateFilter || 
      new Date(report.submittedAt || report.createdAt).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ col }) => (
    sortKey === col ? (
      sortDir === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />
    ) : (
      <span className="inline-block w-4" />
    )
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'In Progress':
        return <Clock4 className="w-4 h-4 text-blue-600" />;
      case 'Under Review':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Rejected':
        return <Ban className="w-4 h-4 text-red-600" />;
      default:
        return <Clock4 className="w-4 h-4 text-gray-600" />;
    }
  };

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

  const getTypeIcon = (type) => {
    if (type?.includes('Accident')) {
      return <CarFront className="w-4 h-4 text-orange-600" />;
    }
    return <FileText className="w-4 h-4 text-blue-600" />;
  };

  const downloadCSV = () => {
    const header = ['Report Number', 'Type', 'Reporter', 'Location', 'Status', 'Submitted Date', 'Description'];
    const body = filteredReports.map(r => [
      r.reportNumber || '',
      r.reportType || '',
      r.reporterName || '',
      r.incidentLocation || '',
      r.status || '',
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '',
      (r.description || '').substring(0, 100)
    ]);
    const csv = [header, ...body].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Reports Management
            </h1>
            <p className="text-gray-600 mt-2">View and manage all police reports and complaints</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadReports}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayReports}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.Pending}</p>
              </div>
              <Clock4 className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.byStatus['In Progress']}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.byStatus.Completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Complaint">Complaint</option>
              <option value="Unknown Accident Report">Accident Report</option>
              <option value="Crime Report">Crime Report</option>
              <option value="Other">Other</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setTypeFilter('All');
                  setDateFilter('');
                  setSortKey('createdAt');
                  setSortDir('desc');
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Reset
              </button>
              <button
                onClick={downloadCSV}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Reports ({filteredReports.length} found)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => toggleSort('reportNumber')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Report Number <SortIcon col="reportNumber" />
                  </th>
                  <th
                    onClick={() => toggleSort('reportType')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Type <SortIcon col="reportType" />
                  </th>
                  <th
                    onClick={() => toggleSort('reporterName')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Reporter <SortIcon col="reporterName" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th
                    onClick={() => toggleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Status <SortIcon col="status" />
                  </th>
                  <th
                    onClick={() => toggleSort('submittedAt')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Submitted <SortIcon col="submittedAt" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7" className="px-6 py-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(report.reportType)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {report.reportNumber || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.reportType || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{report.reporterName || 'Anonymous'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {report.incidentLocation || 'Not specified'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/reports/${report._id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                        <p className="text-sm text-gray-500">
                          {searchTerm || statusFilter !== 'All' || typeFilter !== 'All' || dateFilter
                            ? 'Try adjusting your search criteria'
                            : 'No reports have been submitted yet'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
