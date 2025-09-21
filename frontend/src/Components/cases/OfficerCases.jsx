import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PoliceHeader from '../PoliceHeader/PoliceHeader';

const OfficerCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        const res = await axiosInstance.get(`/cases`, { params: { assignedOfficer: id, limit: 100 } });
        setCases(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleView = (c) => navigate(`/cases/${c._id}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-[#EEF2F7] to-[#F6F8FC] text-[#0B214A]">
      <PoliceHeader />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">Assigned Cases</h1>
          <p className="text-sm text-[#5A6B85] mt-1">Cases assigned to you. Review details, add notes and close cases.</p>
        </div>

        {loading ? (
          <div className="text-sm text-[#5A6B85]">Loading...</div>
        ) : cases.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">No assigned cases.</div>
        ) : (
          <div className="bg-white border border-[#E4E9F2] rounded-2xl shadow overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F5F7FB] text-[#00296B] text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Complainant</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c._id} className="border-t border-[#F0F2F7] hover:bg-[#FFFBEA]">
                    <td className="px-4 py-3 align-middle truncate max-w-[160px]">{c._id}</td>
                    <td className="px-4 py-3 align-middle">{c.complainant?.name || '—'}</td>
                    <td className="px-4 py-3 align-middle">{c.complaintDetails?.typeOfComplaint}</td>
                    <td className="px-4 py-3 align-middle truncate max-w-[220px]">{c.complaintDetails?.location}</td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${c.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(c)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D6DEEB] text-xs hover:bg-[#F5F7FB]">View</button>
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
};

export default OfficerCases;
