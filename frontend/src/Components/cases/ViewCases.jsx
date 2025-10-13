import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ViewCases = () => {
  const navigate = useNavigate();
  const [ongoingCases, setOngoingCases] = useState([]);
  const [closedCases, setClosedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'closed'
  const [urgencyFilter, setUrgencyFilter] = useState('ALL'); // 'ALL', 'HIGH', 'MEDIUM', 'LOW'

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/it-cases', { params: { pageSize: 200 } });
      const casesList = res.data?.data || res.data || [];
      
      console.log('IT Cases:', casesList.map(c => ({ id: c._id, caseId: c.caseId, status: c.status })));
      
      // Filter cases based on status
      const ongoing = casesList.filter(case_ => 
        case_.status === 'NEW' || case_.status === 'ASSIGNED' || case_.status === 'IN_PROGRESS' || case_.status === 'PENDING_CLOSE'
      );
      const closed = casesList.filter(case_ => case_.status === 'CLOSED');
      
      console.log('Ongoing cases:', ongoing.length, 'Closed cases:', closed.length);
      
      setOngoingCases(ongoing);
      setClosedCases(closed);
    } catch (error) {
      console.error('Failed to fetch IT cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOngoingCases = ongoingCases.filter(case_ => {
    const matchesSearch = 
      case_.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.complainant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.complaintDetails?.typeOfComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.itOfficerDetails?.caseAnalysis?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = urgencyFilter === 'ALL' || 
      case_.itOfficerDetails?.urgencyLevel === urgencyFilter;
    
    return matchesSearch && matchesUrgency;
  });

  const filteredClosedCases = closedCases.filter(case_ => {
    const matchesSearch = 
      case_.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.complainant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.complaintDetails?.typeOfComplaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.itOfficerDetails?.caseAnalysis?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = urgencyFilter === 'ALL' || 
      case_.itOfficerDetails?.urgencyLevel === urgencyFilter;
    
    return matchesSearch && matchesUrgency;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export PDF function
  const exportPDF = () => {
    const casesToExport = activeTab === 'ongoing' ? filteredOngoingCases : filteredClosedCases;
    
    if (!casesToExport || casesToExport.length === 0) {
      alert('No cases available to export.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${activeTab === 'ongoing' ? 'Ongoing' : 'Closed'} Cases Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    
    // Add filter information
    let filterInfo = `Filters: Status - ${activeTab === 'ongoing' ? 'Ongoing' : 'Closed'}`;
    if (urgencyFilter !== 'ALL') {
      filterInfo += `, Urgency - ${urgencyFilter}`;
    }
    if (searchTerm) {
      filterInfo += `, Search - "${searchTerm}"`;
    }
    doc.text(filterInfo, 14, 32);

         const tableColumn = [
           'Case ID',
           'Complainant',
           'Type',
           'Location',
           'Status',
           'Assigned Officer',
           'Urgency',
           'Department',
           'Created Date'
         ];
    
         const tableRows = casesToExport.map((case_) => [
           case_.caseId || case_._id,
           case_.complainant?.name || 'Unknown',
           case_.complaintDetails?.typeOfComplaint || 'N/A',
           case_.complaintDetails?.location || 'N/A',
           case_.status || 'N/A',
           case_.assignedOfficer ? (case_.assignedOfficer.name || 'Unknown') : 'Not Assigned',
           case_.itOfficerDetails?.urgencyLevel || 'N/A',
           case_.itOfficerDetails?.assignedDepartment || 'N/A',
           new Date(case_.createdAt).toLocaleDateString()
         ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fontSize: 8, fillColor: [11, 33, 74] }
    });

    doc.save(`${activeTab}-cases-report.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
        <PoliceHeader />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center">Loading cases...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Case Management</h1>
            <p className="text-sm text-[#5A6B85] mt-1">View and manage ongoing and closed cases</p>
          </div>
          <div className="absolute right-0 top-0">
            <button 
              onClick={() => navigate('/itOfficer/ItOfficerDashboard')} 
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Search and Toggle Buttons */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cases by Case ID, complainant, type, or analysis..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:border-[#0B214A] focus:ring-2 focus:ring-[#0B214A]/20"
              />
            </div>
            <button
              onClick={exportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              📄 Export PDF
            </button>
          </div>
          
          {/* Urgency Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Urgency:</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setUrgencyFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  urgencyFilter === 'ALL'
                    ? 'bg-[#0B214A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Urgency Levels
              </button>
              <button
                onClick={() => setUrgencyFilter('HIGH')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  urgencyFilter === 'HIGH'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                🔴 High Priority
              </button>
              <button
                onClick={() => setUrgencyFilter('MEDIUM')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  urgencyFilter === 'MEDIUM'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                🟡 Medium Priority
              </button>
              <button
                onClick={() => setUrgencyFilter('LOW')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  urgencyFilter === 'LOW'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                🟢 Low Priority
              </button>
            </div>
          </div>
          
          {/* Status Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'ongoing'
                  ? 'bg-[#0B214A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ongoing Cases ({filteredOngoingCases.length})
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'closed'
                  ? 'bg-[#0B214A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed Cases ({filteredClosedCases.length})
            </button>
          </div>
        </div>

        {/* Cases Section - Conditional Rendering */}
        {activeTab === 'ongoing' ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#0B214A]">Ongoing Cases</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredOngoingCases.length} cases
              </span>
            </div>
            
            {filteredOngoingCases.length === 0 ? (
              <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-8 text-center">
                <div className="text-gray-500 text-lg">No ongoing cases found</div>
                <div className="text-gray-400 text-sm mt-2">Cases will appear here when created</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOngoingCases.map((case_) => (
                  <div key={case_._id} className="bg-white border border-[#E4E9F2] rounded-2xl shadow hover:shadow-lg transition-shadow p-6">
                    {/* Case Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-[#0B214A] truncate">
                          {case_.caseId || case_._id}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {case_.complainant?.name || 'Unknown Complainant'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status}
                        </span>
                        {case_.itOfficerDetails?.urgencyLevel && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(case_.itOfficerDetails.urgencyLevel)}`}>
                            {case_.itOfficerDetails.urgencyLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Case Details */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Complaint Type:</span>
                        <p className="text-sm text-gray-600">{case_.complaintDetails?.typeOfComplaint || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Location:</span>
                        <p className="text-sm text-gray-600">{case_.complaintDetails?.location || 'N/A'}</p>
                      </div>

                      {case_.itOfficerDetails?.caseAnalysis && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">IT Analysis:</span>
                          <p className="text-sm text-gray-600 line-clamp-2">{case_.itOfficerDetails.caseAnalysis}</p>
                        </div>
                      )}

                      {case_.itOfficerDetails?.assignedDepartment && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Department:</span>
                          <p className="text-sm text-gray-600">{case_.itOfficerDetails.assignedDepartment}</p>
                        </div>
                      )}
                    </div>

                    {/* Resource Allocation */}
                    {case_.resourceAllocation && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Resources:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {case_.resourceAllocation.supportOfficers?.length > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {case_.resourceAllocation.supportOfficers.length} Officers
                            </span>
                          )}
                          {case_.resourceAllocation.vehicles?.length > 0 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {case_.resourceAllocation.vehicles.length} Vehicles
                            </span>
                          )}
                          {case_.resourceAllocation.firearms?.length > 0 && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              {case_.resourceAllocation.firearms.length} Firearms
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Close Request Info */}
                    {case_.status === 'PENDING_CLOSE' && case_.closeRequest && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Close Request Pending
                          </span>
                        </div>
                        <div className="text-xs text-orange-700">
                          <p><strong>Requested by:</strong> {case_.closeRequest.requestedBy?.name || 'Unknown'}</p>
                          <p><strong>Reason:</strong> {case_.closeRequest.reason}</p>
                          <p><strong>Date:</strong> {new Date(case_.closeRequest.requestedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/it/case-details/${case_._id}`)}
                        className="w-full px-4 py-2 text-sm bg-[#0B214A] text-white rounded-lg hover:bg-[#0A1E42] transition font-medium shadow-sm"
                      >
                        View Details
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#0B214A]">Closed Cases</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredClosedCases.length} cases
              </span>
            </div>
            
            {filteredClosedCases.length === 0 ? (
              <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-8 text-center">
                <div className="text-gray-500 text-lg">No closed cases found</div>
                <div className="text-gray-400 text-sm mt-2">Closed cases will appear here</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClosedCases.map((case_) => (
                  <div key={case_._id} className="bg-white border border-[#E4E9F2] rounded-2xl shadow p-6 opacity-75">
                    {/* Case Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-[#0B214A] truncate">
                          {case_.caseId || case_._id}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {case_.complainant?.name || 'Unknown Complainant'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status}
                        </span>
                        {case_.itOfficerDetails?.urgencyLevel && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(case_.itOfficerDetails.urgencyLevel)}`}>
                            {case_.itOfficerDetails.urgencyLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Case Details */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Complaint Type:</span>
                        <p className="text-sm text-gray-600">{case_.complaintDetails?.typeOfComplaint || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Location:</span>
                        <p className="text-sm text-gray-600">{case_.complaintDetails?.location || 'N/A'}</p>
                      </div>

                      {case_.itOfficerDetails?.caseAnalysis && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">IT Analysis:</span>
                          <p className="text-sm text-gray-600 line-clamp-2">{case_.itOfficerDetails.caseAnalysis}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-sm font-medium text-gray-700">Closed:</span>
                        <p className="text-sm text-gray-600">
                          {new Date(case_.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/it/case-details/${case_._id}`)}
                        className="w-full px-4 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium shadow-sm flex items-center justify-center gap-2"
                      >
                        <span>👁️</span>
                        View Details
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCases;
