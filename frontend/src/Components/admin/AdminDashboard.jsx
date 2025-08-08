import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, UserCheck, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          👮 Admin Dashboard - Police360
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Reports Card */}
          <div
            onClick={() => navigate('/admin/reports')}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-2xl p-6 cursor-pointer transition duration-300 shadow-md hover:shadow-lg"
          >
            <FileText className="h-10 w-10 text-blue-400 mb-4" />
            <h2 className="text-xl font-semibold mb-1">View Reports</h2>
            <p className="text-gray-400 text-sm">Access complaints, accident cases, and summaries.</p>
          </div>

          {/* Manage Officers */}
          <div
            onClick={() => navigate('/admin/officers')}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-2xl p-6 cursor-pointer transition duration-300 shadow-md hover:shadow-lg"
          >
            <UserCheck className="h-10 w-10 text-green-400 mb-4" />
            <h2 className="text-xl font-semibold mb-1">Manage Officers</h2>
            <p className="text-gray-400 text-sm">Edit, disable, or review officer records.</p>
          </div>

          {/* Register Officer */}
          <div
            onClick={() => navigate('/admin/register-officer')}
            className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-2xl p-6 cursor-pointer transition duration-300 shadow-md hover:shadow-lg"
          >
            <UserPlus className="h-10 w-10 text-purple-400 mb-4" />
            <h2 className="text-xl font-semibold mb-1">Register Officer</h2>
            <p className="text-gray-400 text-sm">Onboard new officers into the system.</p>
          </div>
        </div>a

        <p className="mt-10 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} Police360 Admin Panel
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
