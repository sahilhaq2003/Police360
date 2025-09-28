import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const AssignAccidents = () => {
  const navigate = useNavigate();
  const [accidents, setAccidents] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [addingComment, setAddingComment] = useState(null);
  const [markingDone, setMarkingDone] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch accidents
      const accidentsRes = await axiosInstance.get('/accidents', {
        params: { page: 1, limit: 100 },
      });
      const accidentsData = accidentsRes.data?.items || accidentsRes.data || [];
      setAccidents(accidentsData);

      // Fetch officers for assignment dropdown from server with role filter
      const officersRes = await axiosInstance.get('/officers', {
        params: { role: 'Officer', pageSize: 100 },
      });
      const officersData =
        officersRes.data?.data ||
        officersRes.data ||
        officersRes.data?.items ||
        [];
      setOfficers(officersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOfficer = async (accidentId, officerId) => {
    setAssigning(accidentId);
    try {
      await axiosInstance.post(`/accidents/${accidentId}/assign`, {
        officerId,
      });
      // Refresh the accidents list
      await fetchData();
      alert('Accident assigned successfully!');
    } catch (error) {
      console.error('Error assigning officer:', error);
      alert('Failed to assign officer. Please try again.');
    } finally {
      setAssigning(null);
    }
  };

  const handleAddComment = async (accidentId) => {
    const commentText = commentTexts[accidentId] || '';
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    setAddingComment(accidentId);
    try {
      await axiosInstance.post(`/accidents/${accidentId}/notes`, {
        note: commentText,
      });
      setCommentTexts((prev) => ({ ...prev, [accidentId]: '' }));
      await fetchData();
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setAddingComment(null);
    }
  };

  const handleCommentTextChange = (accidentId, text) => {
    setCommentTexts((prev) => ({ ...prev, [accidentId]: text }));
  };

  const handleMarkAsDone = async (accidentId) => {
    const confirmed = window.confirm(
      'Are you sure you want to mark this accident as done? This action cannot be undone.'
    );
    if (!confirmed) return;

    setMarkingDone(accidentId);
    try {
      await axiosInstance.put(`/accidents/${accidentId}`, { status: 'CLOSED' });
      await fetchData();
      alert('Accident marked as done!');
    } catch (error) {
      console.error('Error marking as done:', error);
      alert('Failed to mark as done. Please try again.');
    } finally {
      setMarkingDone(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REPORTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_INVESTIGATION':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ROAD_ACCIDENT':
        return 'bg-red-100 text-red-800';
      case 'FIRE':
        return 'bg-orange-100 text-orange-800';
      case 'STRUCTURAL_COLLAPSE':
        return 'bg-purple-100 text-purple-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const userId =
    localStorage.getItem('userId') || sessionStorage.getItem('userId');

  const filteredAccidents = accidents.filter((accident) => {
    const matchesSearch =
      !searchTerm ||
      accident.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accident.locationText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (accident.nic &&
        accident.nic.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || accident.status === statusFilter;
    const matchesType = !typeFilter || accident.accidentType === typeFilter;

    const matchesOfficer =
      accident.assignedOfficer &&
      String(accident.assignedOfficer._id) === String(userId);

    return matchesSearch && matchesStatus && matchesType && matchesOfficer;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Assign Accidents
            </h1>
            <p className="text-sm text-[#5A6B85]">
              Manage accident assignments and officer allocation
            </p>
          </div>
          <button
            onClick={() => navigate('/officer/dashboard')}
            className="px-4 py-2 bg-[#00296B] text-white rounded-lg hover:bg-[#001A4A] transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5A6B85] w-4 h-4" />
              <input
                type="text"
                placeholder="Search by tracking ID, location, or NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#00296B] focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#00296B] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="REPORTED">Reported</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#00296B] focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="ROAD_ACCIDENT">Road Accident</option>
              <option value="FIRE">Fire</option>
              <option value="STRUCTURAL_COLLAPSE">Structural Collapse</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Accidents List */}
        <div className="space-y-4">
          {filteredAccidents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-[#5A6B85] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accidents found</h3>
              <p className="text-sm text-[#5A6B85]">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            filteredAccidents.map((accident) => (
              <div
                key={accident._id}
                className="bg-white rounded-2xl border border-[#E4E9F2] shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        {accident.trackingId}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          accident.status
                        )}`}
                      >
                        {accident.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          accident.accidentType
                        )}`}
                      >
                        {accident.accidentType.replace('_', ' ')}
                      </span>
                      {accident.isEmergency && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Emergency
                        </span>
                      )}
                      {accident.investigationNotes &&
                        accident.investigationNotes.length > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {accident.investigationNotes.length} note
                            {accident.investigationNotes.length !== 1
                              ? 's'
                              : ''}
                          </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#5A6B85]">
                        <MapPin className="w-4 h-4" />
                        <span>{accident.locationText}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#5A6B85]">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(accident.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {accident.nic && (
                        <div className="flex items-center gap-2 text-sm text-[#5A6B85]">
                          <User className="w-4 h-4" />
                          <span>NIC: {accident.nic}</span>
                        </div>
                      )}
                    </div>

                    {accident.assignedOfficer && (
                      <div className="flex items-center gap-2 text-sm text-[#5A6B85] mb-4">
                        <Users className="w-4 h-4" />
                        <span>
                          Assigned to: {accident.assignedOfficer.name} (
                          {accident.assignedOfficer.officerId})
                        </span>
                      </div>
                    )}

                    {/* Show investigation notes if any */}
                    {accident.investigationNotes &&
                      accident.investigationNotes.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-medium text-[#5A6B85] mb-2">
                            Investigation Notes:
                          </div>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {accident.investigationNotes
                              .slice(-3)
                              .map((note, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-[#5A6B85] bg-[#F8FAFC] p-2 rounded border"
                                >
                                  <div className="font-medium">
                                    {note.addedBy}
                                  </div>
                                  <div>{note.note}</div>
                                </div>
                              ))}
                            {accident.investigationNotes.length > 3 && (
                              <div className="text-xs text-[#5A6B85] italic">
                                +{accident.investigationNotes.length - 3} more
                                notes
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/accidents/${accident._id}`)}
                      className="px-4 py-2 bg-[#00296B] text-white rounded-lg hover:bg-[#001A4A] transition text-sm"
                    >
                      View Details
                    </button>

                    {!accident.assignedOfficer && (
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignOfficer(accident._id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          disabled={assigning === accident._id}
                          className="px-3 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#00296B] focus:border-transparent text-sm min-w-[150px]"
                        >
                          <option value="">Assign Officer</option>
                          {officers
                            .filter(
                              (o) => (o.role || '').toLowerCase() === 'officer'
                            )
                            .map((officer) => (
                              <option key={officer._id} value={officer._id}>
                                {officer.name} ({officer.officerId})
                              </option>
                            ))}
                        </select>
                        {assigning === accident._id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                            <Clock className="w-4 h-4 animate-spin text-[#00296B]" />
                          </div>
                        )}
                      </div>
                    )}

                    {accident.assignedOfficer &&
                      accident.status !== 'CLOSED' && (
                        <div className="space-y-2">
                          {/* Add Comment Section */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add investigation note..."
                              value={commentTexts[accident._id] || ''}
                              onChange={(e) =>
                                handleCommentTextChange(
                                  accident._id,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-[#E4E9F2] rounded-lg focus:ring-2 focus:ring-[#00296B] focus:border-transparent text-sm"
                            />
                            <button
                              onClick={() => handleAddComment(accident._id)}
                              disabled={
                                addingComment === accident._id ||
                                !(commentTexts[accident._id] || '').trim()
                              }
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {addingComment === accident._id ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <MessageSquare className="w-4 h-4" />
                              )}
                              Add
                            </button>
                          </div>

                          {/* Mark as Done Button */}
                          <button
                            onClick={() => handleMarkAsDone(accident._id)}
                            disabled={markingDone === accident._id}
                            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            {markingDone === accident._id ? (
                              <Clock className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Mark as Done
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center text-xs text-[#5A6B85]">
          Showing {filteredAccidents.length} of {accidents.length} accidents
        </div>
      </div>
    </div>
  );
};

export default AssignAccidents;
