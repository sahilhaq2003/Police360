import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegisterOfficer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', officerId: '', email: '', contactNumber: '',
    station: '', role: 'Officer', username: '', password: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'Admin') {
      alert('Access Denied. Only Admins can access this page.');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/officers', formData);
      alert('Officer registered successfully');
      setFormData({
        name: '', officerId: '', email: '', contactNumber: '',
        station: '', role: 'Officer', username: '', password: ''
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Register New Officer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Officer ID</label>
            <input
              name="officerId"
              value={formData.officerId}
              onChange={handleChange}
              placeholder="Officer ID"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contact Number</label>
            <input
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Station</label>
            <input
              name="station"
              value={formData.station}
              onChange={handleChange}
              placeholder="Station"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Officer">Officer</option>
              <option value="Inspector">Inspector</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              value={formData.password}
              type="password"
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="col-span-full pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Register Officer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterOfficer;
