import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { ArrowLeft } from 'lucide-react';

const OfficerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficer = async () => {
      try {
        const res = await axiosInstance.get('/officers');
        const match = res.data.find(o => o._id === id);
        setOfficer(match);
      } catch (err) {
        console.error('Error loading officer profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficer();
  }, [id]);

  if (loading) return <div className="p-8 text-[#0B214A] font-medium">Loading officer profile...</div>;
  if (!officer) return <div className="p-8 text-red-600 font-semibold">Officer not found.</div>;

  return (
    <div className="min-h-screen bg-[#E9EDF4] px-6 py-12 text-[#0B214A]">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl border border-[#0B214A] p-10 relative">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-sm text-[#003366] hover:underline flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-[#0B214A] pb-2 border-b-2 border-[#FFD700] mb-8 uppercase tracking-wider">
          Officer Profile
        </h2>

        {/* Form-style Details */}
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <FormField label="Full Name" value={officer.name} />
          <FormField label="Officer ID" value={officer.officerId} />
          <FormField label="Email" value={officer.email} />
          <FormField label="Contact Number" value={officer.contactNumber} />
          <FormField label="Station" value={officer.station} />
          <FormField label="Username" value={officer.username} />
          <FormField label="Role" value={officer.role} />
          <FormField
            label="Status"
            value={officer.isActive ? 'Active' : 'Inactive'}
            color={officer.isActive ? 'text-green-700' : 'text-red-600'}
          />
          <FormField
            label="Joined"
            value={new Date(officer.createdAt).toLocaleString()}
            full
          />
        </form>
      </div>
    </div>
  );
};

// Reusable Form Field Component
const FormField = ({ label, value, color = 'text-[#0B214A]', full = false }) => (
  <div className={full ? 'col-span-full' : ''}>
    <label className="block text-xs font-semibold text-[#003366] uppercase mb-1">{label}</label>
    <div
      className={`w-full bg-[#F9FAFB] border border-gray-300 rounded-md px-4 py-2 ${color} text-sm font-medium`}
    >
      {value}
    </div>
  </div>
);

export default OfficerProfile;
