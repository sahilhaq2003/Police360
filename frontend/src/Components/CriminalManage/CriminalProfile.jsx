import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PoliceHeader from "../PoliceHeader/PoliceHeader";
import { getMediaUrl } from '../../utils/mediaUrl';
import axiosInstance from "../../utils/axiosInstance";

export default function CriminalProfile() {
  const [criminal, setCriminal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { id: paramId } = useParams();
  const location = useLocation();

  // Get criminal ID from multiple sources
  const criminalId = paramId || 
                     new URLSearchParams(location.search).get('id') || 
                     localStorage.getItem('selectedCriminalId');

  useEffect(() => {
    if (criminalId) {
      fetchCriminalDetails(criminalId);
    } else {
      setError("No criminal ID provided");
      setLoading(false);
    }
  }, [criminalId]);

  const fetchCriminalDetails = async (id) => {
    try {
      const response = await axiosInstance.get(`/criminals/${id}`);
      setCriminal(response.data);
    } catch (err) {
      console.error('Error fetching criminal:', err);
      if (err.response) {
        setError(err.response.data?.message || "Failed to fetch criminal details");
      } else if (err.request) {
        setError("Network error. Please check if the server is running.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const buildPrintableHtml = (criminal) => {
    const arrestsRows = (criminal.arrests || []).map(a => `
        <tr>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.offenseCode || 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.institution || 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.charge || 'N/A'}</td>
          <td style="padding:6px;border:1px solid #e6e6e6">${a.term || 'N/A'}</td>
        </tr>
      `).join('');

    const fingerprintsHtml = (criminal.fingerprints || []).map(fp => `
        <div style="display:inline-block;width:120px;text-align:center;margin:50px">
        </br>
        </br>
          <div style="width:100px;height:80px;border:1px solid #eee;overflow:hidden;margin:0 auto">
            ${fp.url ? `<img src="${getMediaUrl(fp.url)}" style="width:100%;height:100%;object-fit:cover"/>` : '<div style="line-height:80px;color:#999">No Image</div>'}
          </div>
          <div style="font-size:11px;color:#444;margin-top:6px">${fp.name || ''}</div>
        </div>
      `).join('');

    return `
      <html>
        <head>
          <title>Criminal Record - ${criminal.name || ''}</title>
          </br>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            body { font-family: Arial, sans-serif; color: #0B214A; padding: 20px }
            .header { display:flex; gap:16px; align-items:flex-start }
            .photo { width:140px; height:180px; object-fit:cover; border:1px solid #E6E9EF }
            .meta h1 { margin:0; font-size:22px }
            .section { margin-top:18px }
            .kv { display:flex; gap:8px; margin-top:6px }
            .k { width:180px; font-weight:600 }
            table { border-collapse:collapse; width:100%; margin-top:8px }
            th, td { text-align:left; padding:8px; border:1px solid #e6e6e6 }
          </style>
        </head>
        <body>
          <div class="header">
            <div><img src="${getMediaUrl(criminal.photo) || '/images/placeholder.png'}" class="photo"/></div>
            <div style="flex:1">
              <h1 style="margin:0">${criminal.name || 'Unknown'}</h1>
              <div style="margin-top:6px">Criminal ID: ${criminal.criminalId || 'N/A'}</div>
              <div>NIC: ${criminal.nic || 'N/A'}</div>
              <div>File Number: ${criminal.fileNumber || 'N/A'}</div>
              <div>Record ID: ${criminal.recordId || 'N/A'}</div>
              <div style="margin-top:8px">Created By: ${criminal.createdBy || 'System'}</div>
            </div>
          </div>

          <div class="section">
            <h3 style="margin:0 0 6px 0">Status</h3>
            <div>${criminal.criminalStatus || 'N/A'}</div>
            <div style="margin-top:6px">${criminal.rewardPrice ? 'Reward: LKR ' + criminal.rewardPrice.toLocaleString() : ''}</div>
            <div style="margin-top:6px">${criminal.arrestDate ? 'Arrested: ' + new Date(criminal.arrestDate).toLocaleDateString() : ''}</div>
            <div style="margin-top:6px">${(criminal.prisonDays || criminal.prisonDays === 0) ? 'Prison Time: ' + criminal.prisonDays + ' days' : ''}</div>
            <div style="margin-top:6px">${criminal.releaseDate ? 'Released: ' + new Date(criminal.releaseDate).toLocaleDateString() : ''}</div>
          </div>

          <div class="section">
            <h3 style="margin:0 0 6px 0">Personal Details</h3>
            <div class="kv"><div class="k">Address:</div><div>${criminal.address || 'N/A'}</div></div>
            <div class="kv"><div class="k">Aliases:</div><div>${criminal.aliases || 'N/A'}</div></div>
            <div class="kv"><div class="k">DOB:</div><div>${(criminal.dob ? (criminal.dob.day && criminal.dob.month && criminal.dob.year ? `${criminal.dob.day}/${criminal.dob.month}/${criminal.dob.year}` : (criminal.dob.d && criminal.dob.m && criminal.dob.y ? `${criminal.dob.d}/${criminal.dob.m}/${criminal.dob.y}` : 'N/A')) : 'N/A')}</div></div>
            <div class="kv"><div class="k">Gender:</div><div>${criminal.gender || 'N/A'}</div></div>
            <div class="kv"><div class="k">Citizenship:</div><div>${criminal.citizen || 'N/A'}</div></div>
            <div class="kv"><div class="k">Height:</div><div>${criminal.height ? criminal.height + ' cm' : 'N/A'}</div></div>
            <div class="kv"><div class="k">Weight:</div><div>${criminal.weight ? criminal.weight + ' kg' : 'N/A'}</div></div>
            <div class="kv"><div class="k">Eye Color:</div><div>${criminal.eyeColor || 'N/A'}</div></div>
            <div class="kv"><div class="k">Hair Color:</div><div>${criminal.hairColor || 'N/A'}</div></div>
            <div class="kv"><div class="k">Marital Status:</div><div>${criminal.maritalStatus || 'N/A'}</div></div>
          </div>

          ${criminal.arrests && criminal.arrests.length > 0 ? `
            <div class="section">
              <h3 style="margin:0 0 6px 0">Arrest & Sentencing History</h3>
              <table>
                <thead>
                  <tr><th>Date</th><th>Offense Code</th><th>Institution</th><th>Charge</th><th>Term</th></tr>
                </thead>
                <tbody>
                  ${arrestsRows}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${criminal.fingerprints && criminal.fingerprints.length > 0 ? `
            <div class="section">
              <h3 style="margin:0 0 6px 0">Fingerprints</h3>
              <div style="display:flex;flex-wrap:wrap">${fingerprintsHtml}</div>
            </div>
          ` : ''}

          <div class="section">
            <h3 style="margin: 0 6px 0">Other Information</h3>
            <div>${criminal.otherInfo ? `<pre style="white-space:pre-wrap;font-family:inherit">${criminal.otherInfo}</pre>` : 'N/A'}</div>
          </div>

          <div class="section">
            <h3 style="margin:0 0 6px 0">Crime Information</h3>
            <div>${criminal.crimeInfo ? `<pre style="white-space:pre-wrap;font-family:inherit">${criminal.crimeInfo}</pre>` : 'N/A'}</div>
          </div>

          <div class="section" style="margin-top:18px;color:#666;font-size:12px">
            <div>Record Created: ${criminal.createdAt ? new Date(criminal.createdAt).toLocaleString() : 'N/A'}</div>
            <div>Last Updated: ${criminal.updatedAt ? new Date(criminal.updatedAt).toLocaleString() : 'N/A'}</div>
          </div>

          <script>window.onload=function(){ setTimeout(()=>{ window.print(); window.close(); },200); };</script>
        </body>
      </html>
    `;
  };

  const handlePrintRecord = (ev) => {
    ev.preventDefault();
    if (!criminal) return alert('No record to print');
    const html = buildPrintableHtml(criminal);
    const w = window.open('', '_blank', 'width=900,height=1000');
    w.document.open(); w.document.write(html); w.document.close();
  };

  const handleExportPdf = (ev) => {
    // Use same flow — browser print dialog supports Save as PDF
    handlePrintRecord(ev);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDOB = (dob) => {
    if (!dob) return "N/A";
    
    // Handle both old format (d, m, y) and new format (day, month, year)
    if (dob.day && dob.month && dob.year) {
      return `${dob.day}/${dob.month}/${dob.year}`;
    } else if (dob.d && dob.m && dob.y) {
      return `${dob.d}/${dob.m}/${dob.y}`;
    }
    
    return "N/A";
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'wanted': 'bg-red-100 text-red-800 border-red-200',
      'arrested': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in prison': 'bg-orange-100 text-orange-800 border-orange-200',
      'released': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading criminal details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !criminal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
        <PoliceHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error || "Criminal not found"}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Photo */}
              <div className="w-32 h-40 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                {criminal.photo ? (
                  <img 
                    src={getMediaUrl(criminal.photo)} 
                    alt="Criminal Photo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">NO PHOTO</span>
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-3xl font-bold text-[#0B214A]">{criminal.name || "Unknown"}</h1>
                  {getStatusBadge(criminal.criminalStatus)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">Criminal ID:</span>
                    <span className="ml-2 font-mono">#{criminal.criminalId || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">NIC:</span>
                    <span className="ml-2">{criminal.nic || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">File Number:</span>
                    <span className="ml-2 font-mono text-xs">{criminal.fileNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Record ID:</span>
                    <span className="ml-2 font-mono text-xs">{criminal.recordId || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => navigate(`/CriminalManage/Criminal?edit=${criminal._id}`)}
                className="px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700 text-sm"
              >
                Edit Record
              </button>
              <button onClick={handlePrintRecord} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                Print Record
              </button>
              <button onClick={handleExportPdf} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                Export PDF
              </button>
              <button 
                onClick={() => navigate('/CriminalManage/CriminalManage')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-600">Full Name:</span>
                    <p className="text-gray-800">{criminal.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Aliases:</span>
                    <p className="text-gray-800">{criminal.aliases || "None"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Date of Birth:</span>
                    <p className="text-gray-800">{formatDOB(criminal.dob)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Gender:</span>
                    <p className="text-gray-800 capitalize">{criminal.gender || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Citizenship:</span>
                    <p className="text-gray-800">{criminal.citizen || "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-600">Height:</span>
                    <p className="text-gray-800">{criminal.height ? `${criminal.height} cm` : "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Weight:</span>
                    <p className="text-gray-800">{criminal.weight ? `${criminal.weight} kg` : "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Eye Color:</span>
                    <p className="text-gray-800 capitalize">{criminal.eyeColor || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Hair Color:</span>
                    <p className="text-gray-800 capitalize">{criminal.hairColor || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Marital Status:</span>
                    <p className="text-gray-800 capitalize">{criminal.maritalStatus || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="font-semibold text-gray-600">Address:</span>
                <p className="text-gray-800 mt-1">{criminal.address || "N/A"}</p>
              </div>
            </div>

            {/* Criminal Status Details */}
            {criminal.criminalStatus && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                  Status Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criminal.criminalStatus === 'wanted' && criminal.rewardPrice && (
                    <div>
                      <span className="font-semibold text-gray-600">Reward Amount:</span>
                      <p className="text-red-600 font-bold text-lg">LKR {criminal.rewardPrice.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {criminal.criminalStatus === 'arrested' && criminal.arrestDate && (
                    <div>
                      <span className="font-semibold text-gray-600">Arrest Date:</span>
                      <p className="text-gray-800">{formatDate(criminal.arrestDate)}</p>
                    </div>
                  )}
                  
                  {criminal.criminalStatus === 'in prison' && criminal.prisonDays && (
                    <div>
                      <span className="font-semibold text-gray-600">Prison Time:</span>
                      <p className="text-gray-800">{criminal.prisonDays} days</p>
                    </div>
                  )}
                  
                  {criminal.criminalStatus === 'released' && criminal.releaseDate && (
                    <div>
                      <span className="font-semibold text-gray-600">Release Date:</span>
                      <p className="text-gray-800">{formatDate(criminal.releaseDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Arrest & Sentencing History */}
            {criminal.arrests && criminal.arrests.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                  Arrest & Sentencing History
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Offense Code</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Institution</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Charge</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criminal.arrests.map((arrest, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-3 py-2">{formatDate(arrest.date)}</td>
                          <td className="px-3 py-2 font-mono">{arrest.offenseCode || "N/A"}</td>
                          <td className="px-3 py-2">{arrest.institution || "N/A"}</td>
                          <td className="px-3 py-2">{arrest.charge || "N/A"}</td>
                          <td className="px-3 py-2">{arrest.term || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                Additional Information
              </h2>
              
              <div className="space-y-4">
                {criminal.otherInfo && (
                  <div>
                    <span className="font-semibold text-gray-600">Other Information:</span>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{criminal.otherInfo}</p>
                  </div>
                )}
                
                {criminal.crimeInfo && (
                  <div>
                    <span className="font-semibold text-gray-600">Crime Information:</span>
                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{criminal.crimeInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fingerprints */}
            {criminal.fingerprints && criminal.fingerprints.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                  Fingerprints
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                        {criminal.fingerprints.map((print, index) => (
                    <div key={index} className="border border-gray-300 rounded p-2 text-center">
                      <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {print?.url ? (
                          <img src={getMediaUrl(print.url)} alt={`fp-${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-500">Print #{index + 1}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{print?.name || print?.url || `#${index + 1}`}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">Update Status</button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Add New Arrest</button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">View Full History</button>
                </div>
              </div>
            )}

            {/* Record Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">
                Record Information
              </h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">Created By:</span>
                  <p className="text-gray-800">{criminal.createdBy || "System"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Last Updated:</span>
                  <p className="text-gray-800">{formatDate(criminal.updatedAt)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Record Status:</span>
                  <p className="text-gray-800">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
