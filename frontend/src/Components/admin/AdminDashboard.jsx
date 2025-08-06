import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, UserCheck, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0B214A] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 tracking-tight">
          👮 Admin Dashboard
          <span className="block text-[#FFD700] text-lg font-medium mt-1">Police360 Management Panel</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* View Reports */}
          <div
            onClick={() => navigate('/admin/reports')}
            className="bg-white hover:bg-[#fefce8] border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <FileText className="h-10 w-10 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-1">View Reports</h2>
            <p className="text-gray-600 text-sm">
              Access complaints, accident cases, and summary reports submitted by users.
            </p>
          </div>

          {/* Manage Officers */}
          <div
            onClick={() => navigate('/admin/officers')}
            className="bg-white hover:bg-[#fefce8] border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <UserCheck className="h-10 w-10 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold mb-1">Manage Officers</h2>
            <p className="text-gray-600 text-sm">
              View, edit, or deactivate officer accounts and monitor their assignments.
            </p>
          </div>

          {/* Register Officer */}
          <div
            onClick={() => navigate('/admin/register-officer')}
            className="bg-white hover:bg-[#fefce8] border border-gray-200 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <UserPlus className="h-10 w-10 text-purple-600 mb-4" />
            <h2 className="text-xl font-semibold mb-1">Register Officer</h2>
            <p className="text-gray-600 text-sm">
              Onboard new police officers by creating and assigning secure login credentials.
            </p>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Police360 Admin Panel. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
