import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Officers = () => {
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const res = await axiosInstance.get('/officers');
        setOfficers(res.data || []);
        setFilteredOfficers(res.data || []);
      } catch (err) {
        setError('Failed to fetch officers.');
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  useEffect(() => {
    const filtered = officers.filter(officer =>
      Object.values(officer).some(field =>
        field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredOfficers(filtered);
  }, [searchTerm, officers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DCE3EA] via-[#F0F3F7] to-[#DCE3EA] text-[#0B214A] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-[#00296B] tracking-tight">
          Sri Lanka Police – Officer Directory
        </h1>

        {/* 🔍 Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full sm:w-3/4 md:w-1/2">
            <input
              type="text"
              placeholder="🔍 Search by name, officer ID, email, role..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#B0C4DE] shadow-sm bg-[#F9FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#00296B] transition-all duration-200"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00296B]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-600 font-medium text-center">{error}</p>
        ) : filteredOfficers.length === 0 ? (
          <p className="text-gray-500 italic text-center">No matching officers found.</p>
        ) : (
          <div className="bg-white border border-[#C0C0C0] rounded-2xl shadow-lg overflow-x-auto">
            <table className="min-w-full text-sm text-[#0B214A]">
              <thead className="bg-[#EDF1F5] text-left text-xs font-semibold uppercase text-[#00296B]">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Officer ID</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Station</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map(officer => (
                  <tr
                    key={officer._id}
                    className="border-t border-gray-100 hover:bg-[#FFF7D1] transition duration-150 cursor-pointer"
                    onClick={() => navigate(`/admin/officer/${officer._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{officer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{officer.officerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{officer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{officer.contactNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{officer.station}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{officer.role}</td>
                    <td className="px-6 py-4">
                      {officer.isActive ? (
                        <span className="text-green-700 font-semibold">Active</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Inactive</span>
                      )}
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

export default Officers;
