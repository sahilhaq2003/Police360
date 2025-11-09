import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PoliceHeader from '../PoliceHeader/PoliceHeader';
import { getMediaUrl } from '../../utils/mediaUrl';
import axiosInstance from '../../utils/axiosInstance';
import SuspectPrintExport from './SuspectPrintExport';

export default function SuspectProfile() {
  const [suspect, setSuspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { id: paramId } = useParams();
  const location = useLocation();

  const suspectId = paramId || new URLSearchParams(location.search).get('id') || localStorage.getItem('selectedSuspectId');

  useEffect(() => {
    if (suspectId) fetchSuspect(suspectId);
    else { setError('No suspect ID provided'); setLoading(false); }
  }, [suspectId]);

  const fetchSuspect = async (id) => {
    try {
      const res = await axiosInstance.get(`/suspects/${id}`);
      setSuspect(res.data);
    } catch (err) {
      console.error('Error fetching suspect', err);
      if (err.response) setError(err.response.data?.message || 'Failed to fetch suspect');
      else if (err.request) setError('Network error. Is the server running?');
      else setError('Unexpected error');
    } finally { setLoading(false); }
  };

  const formatDate = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString(); };

  const formatDOB = (dob) => {
    if (!dob) return 'N/A';
    if (dob.day && dob.month && dob.year) return `${dob.day}/${dob.month}/${dob.year}`;
    if (dob.d && dob.m && dob.y) return `${dob.d}/${dob.m}/${dob.y}`;
    return 'N/A';
  };

  const getStatusBadge = (status) => {
    const map = {
      wanted: 'bg-red-100 text-red-800 border-red-200',
      arrested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in prison': 'bg-orange-100 text-orange-800 border-orange-200',
      released: 'bg-green-100 text-green-800 border-green-200'
    };
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status]||'bg-gray-100 text-gray-800 border-gray-200'}`}>{status?.toUpperCase()||'UNKNOWN'}</span>);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]">
      <PoliceHeader />
      <div className="flex items-center justify-center h-96"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B214A] mx-auto mb-4"></div><p className="text-gray-600">Loading suspect details...</p></div></div>
    </div>
  );

  if (error || !suspect) return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC]"><PoliceHeader /><div className="flex items-center justify-center h-96"><div className="text-center"><div className="text-red-500 text-6xl mb-4">⚠️</div><h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2><p className="text-gray-600">{error||'Suspect not found'}</p><button onClick={()=>window.history.back()} className="mt-4 px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700">Go Back</button></div></div></div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-32 h-40 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                {suspect.photo ? (
                  <img
                    src={getMediaUrl(suspect.photo)}
                    alt="photo"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/PLogo.png'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-sm">NO PHOTO</span></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2"><h1 className="text-3xl font-bold text-[#0B214A]">{suspect.name||'Unknown'}</h1>{getStatusBadge(suspect.suspectStatus)}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-semibold text-gray-600">Suspect ID:</span><span className="ml-2 font-mono">#{suspect.suspectId||'N/A'}</span></div>
                  <div><span className="font-semibold text-gray-600">NIC:</span><span className="ml-2">{suspect.nic||'N/A'}</span></div>
                  <div><span className="font-semibold text-gray-600">File Number:</span><span className="ml-2 font-mono text-xs">{suspect.fileNumber||'N/A'}</span></div>
                  <div><span className="font-semibold text-gray-600">Record ID:</span><span className="ml-2 font-mono text-xs">{suspect.recordId||'N/A'}</span></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button onClick={()=>navigate(`/SuspectManage/SuspectUpdate/${suspect._id}`)} className="px-4 py-2 bg-[#0B214A] text-white rounded hover:bg-blue-700 text-sm">Edit Record</button>
              <SuspectPrintExport suspect={suspect} />
              <button onClick={()=>navigate('/SuspectManage/SuspectManage')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">Back to List</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6"><h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">Personal Information</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-3"><div><span className="font-semibold text-gray-600">Full Name:</span><p className="text-gray-800">{suspect.name||'N/A'}</p></div><div><span className="font-semibold text-gray-600">Date of Birth:</span><p className="text-gray-800">{formatDOB(suspect.dob)}</p></div><div><span className="font-semibold text-gray-600">Gender:</span><p className="text-gray-800 capitalize">{suspect.gender||'N/A'}</p></div><div><span className="font-semibold text-gray-600">Citizenship:</span><p className="text-gray-800">{suspect.citizen||'N/A'}</p></div></div><div className="space-y-3"><div><span className="font-semibold text-gray-600">Address:</span><p className="text-gray-800 mt-1">{suspect.address||'N/A'}</p></div></div></div></div>

            {suspect.suspectStatus && (
              <div className="bg-white rounded-lg shadow-lg p-6"><h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">Status Information</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{suspect.suspectStatus==='wanted' && suspect.rewardPrice && (<div><span className="font-semibold text-gray-600">Reward Amount:</span><p className="text-red-600 font-bold text-lg">LKR {suspect.rewardPrice.toLocaleString()}</p></div>)}{suspect.suspectStatus==='arrested' && suspect.arrestDate && (<div><span className="font-semibold text-gray-600">Arrest Date:</span><p className="text-gray-800">{formatDate(suspect.arrestDate)}</p></div>)}{suspect.suspectStatus==='in prison' && suspect.prisonDays && (<div><span className="font-semibold text-gray-600">Prison Time:</span><p className="text-gray-800">{suspect.prisonDays} days</p></div>)}{suspect.suspectStatus==='released' && suspect.releaseDate && (<div><span className="font-semibold text-gray-600">Release Date:</span><p className="text-gray-800">{formatDate(suspect.releaseDate)}</p></div>)}</div></div>
            )}

            {suspect.crimeInfo && (
              <div className="bg-white rounded-lg shadow-lg p-6"><h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">Crime Information</h2><p className="text-gray-800 whitespace-pre-wrap">{suspect.crimeInfo}</p></div>
            )}
          </div>

          <div className="space-y-6">
            {suspect.fingerprints && suspect.fingerprints.length>0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">Fingerprints</h2>
                <div className="grid grid-cols-2 gap-3">
                  {suspect.fingerprints.map((p, i) => (
                    <div key={i} className="border border-gray-300 rounded p-2 text-center">
                      <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {p?.url ? (
                          <img
                            src={getMediaUrl(p.url)}
                            alt={`fp-${i+1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/PLogo.png'; }}
                          />
                        ) : (
                          <span className="text-xs text-gray-500">Print #{i+1}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{p?.name || p?.url || `#${i+1}`}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">Update Status</button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Add New Note</button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">View Full History</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6"><h2 className="text-xl font-bold text-[#0B214A] mb-4 border-b border-gray-200 pb-2">Record Information</h2><div className="space-y-3 text-sm"><div><span className="font-semibold text-gray-600">Created By:</span><p className="text-gray-800">{suspect.createdBy||'System'}</p></div><div><span className="font-semibold text-gray-600">Last Updated:</span><p className="text-gray-800">{suspect.updatedAt ? new Date(suspect.updatedAt).toLocaleDateString() : 'N/A'}</p></div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
