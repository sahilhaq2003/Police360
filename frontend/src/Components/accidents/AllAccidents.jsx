import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, UserCheck } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const URL = 'http://localhost:8000/api/accidents';

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => {
    console.log('API Response:', res.data);

    if (res.data.items && Array.isArray(res.data.items)) {
      return res.data.items;
    }

    if (Array.isArray(res.data)) {
      return res.data;
    }

    return [res.data];
  });
};

function AllAccidents() {
  const [accidents, setAccidents] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  useEffect(() => {
    fetchHandler().then((data) => setAccidents(data));
    // load officers for dropdown (requires auth)
    (async () => {
      try {
        const res = await axiosInstance.get('/officers', {
          params: { page: 1, pageSize: 100 },
        });
        const list = res.data?.data?.docs || res.data?.data || res.data || [];
        setOfficers(Array.isArray(list) ? list : []);
      } catch (e) {
        alert(
          e?.response?.data?.message || e.message || 'Failed to load officers'
        );
      }
    })();
  }, []);

  const startAssign = (accident) => {
    setAssigningId(accident._id);
    setSelectedOfficerId('');
  };

  const cancelAssign = () => {
    setAssigningId(null);
    setSelectedOfficerId('');
  };

  const confirmAssign = async (accident) => {
    if (!selectedOfficerId) return alert('Please select an officer');

    try {
      // Use axiosInstance to call your backend directly
      const res = await axiosInstance.post(
        `/accidents/${accident._id}/assign`,
        { officerId: selectedOfficerId }
      );

      const updated = res.data;

      setAccidents((prev) =>
        prev.map((a) => (a._id === accident._id ? updated : a))
      );

      setAssigningId(null);
      setSelectedOfficerId('');
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to assign');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Accident Records
          </h1>
          <p className="text-sm text-[#5A6B85] mt-1">
            Browse, assign and manage reported accidents
          </p>
        </div>

        {accidents.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">
            No accidents found.
          </div>
        ) : (
          <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F5F7FB] text-[#00296B] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Tracking ID</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Emergency</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Assigned Officer</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accidents.map((accident) => (
                  <tr
                    key={accident._id}
                    className="border-t border-[#F0F2F7] hover:bg-[#FFFBEA]"
                  >
                    <td className="px-4 py-3 align-middle truncate max-w-[160px]">
                      {accident._id}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {accident.trackingId}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {accident.accidentType?.replaceAll('_', ' ')}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          accident.isEmergency
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {accident.isEmergency ? 'Emergency' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle truncate max-w-[220px]">
                      {accident.locationText}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {accident.assignedOfficer
                        ? accident.assignedOfficer.name ||
                          accident.assignedOfficer.officerId ||
                          String(accident.assignedOfficer)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {assigningId === accident._id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="px-2 py-1 rounded-lg border border-[#D6DEEB] bg-white text-xs"
                              value={selectedOfficerId}
                              onChange={(e) =>
                                setSelectedOfficerId(e.target.value)
                              }
                            >
                              <option value="">Select officer…</option>
                              {officers
                                .filter((o) => o.role === 'Officer')
                                .map((o) => (
                                  <option key={o._id} value={o._id}>
                                    {o.name || o.officerId || o.email}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => confirmAssign(accident)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0B214A] text-white text-xs hover:opacity-95"
                            >
                              <UserCheck className="w-4 h-4" /> Save
                            </button>
                            <button
                              onClick={cancelAssign}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs hover:bg-[#F5F7FB]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startAssign(accident)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0B214A] text-white text-xs hover:opacity-95"
                          >
                            <UserCheck className="w-4 h-4" /> Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllAccidents;
