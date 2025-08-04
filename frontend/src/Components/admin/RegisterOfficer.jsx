import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Home, Server, Key, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import loginBg from '../../assets/loginbg.jpg';

const shake = {
  x: [0, -5, 5, -5, 5, 0],
  transition: { duration: 0.3 }
};

export default function RegisterOfficer() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '', officerId: '', email: '', contactNumber: '', station: '', role: 'Officer', username: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role !== 'Admin') {
      alert('Access Denied. Only Admins can access this page.');
      navigate('/login');
    }
  }, [navigate]);

  const onChange = ({ target: { name, value } }) => {
    setData(d => ({ ...d, [name]: value }));
    if (error) setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/officers', data);
      alert('Officer registered successfully');
      setData({ name: '', officerId: '', email: '', contactNumber: '', station: '', role: 'Officer', username: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const IconMap = { name: User, officerId: Server, email: Mail, contactNumber: Phone, station: Home, username: User, password: Key };
  const fields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'officerId', label: 'Officer ID', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'contactNumber', label: 'Contact No.', type: 'text' },
    { key: 'station', label: 'Station', type: 'text' },
    { key: 'role', label: 'Role', type: 'select', options: ['Officer', 'IT Officer'] },
    { key: 'username', label: 'Username', type: 'text' },
    { key: 'password', label: 'Password', type: 'password' }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
      <div className="absolute inset-0 bg-black opacity-60" />
      <motion.div
        className="relative w-full max-w-5xl mx-auto bg-gray-900 bg-opacity-85 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        animate={error ? shake : undefined}
      >
        {/* Side panel */}
        <div className="hidden md:block md:w-1/3 bg-gradient-to-b from-indigo-600 to-indigo-800 p-8 flex flex-col justify-center">
          <img src="/police-badge.png" alt="Badge" className="h-16 mb-4 filter brightness-0 invert mx-auto" />
          <h2 className="text-white text-2xl font-bold text-center">Welcome, Admin</h2>
          <p className="mt-2 text-gray-300 text-center">Create officer accounts efficiently.</p>
        </div>

        {/* Form panel */}
        <div className="w-full md:w-2/3 p-6 md:p-8">
          <h3 className="text-xl font-semibold text-white mb-4">Register New Officer</h3>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, type, options }) => {
              const Icon = IconMap[key];
              return (
                <div key={key} className="col-span-full sm:col-span-1">
                  <label htmlFor={key} className="block text-sm text-gray-200 mb-1">{label}</label>
                  <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                    {Icon && <Icon className="text-gray-400 mr-2" size={16} />}
                    {type === 'select' ? (
                      <select
                        id={key}
                        name={key}
                        value={data[key]}
                        onChange={onChange}
                        className="w-full bg-transparent text-gray-100 text-sm outline-none"
                        required
                      >
                        {options.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        id={key}
                        name={key}
                        type={type}
                        value={data[key]}
                        onChange={onChange}
                        placeholder={label}
                        className="w-full bg-transparent text-gray-100 text-sm placeholder-gray-500 outline-none"
                        required
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <button
              type="submit"
              disabled={loading}
              className="col-span-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Register Officer'}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-gray-400">&copy; {new Date().getFullYear()} Police360</p>
        </div>
      </motion.div>
    </div>
  );
}
