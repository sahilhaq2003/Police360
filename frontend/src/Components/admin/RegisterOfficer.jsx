import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Home, Server, Key, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import loginBg from '../../assets/loginbg.jpg';
import AdminHeader from '../AdminHeader/AdminHeader';

const shake = {
  x: [0, -5, 5, -5, 5, 0],
  transition: { duration: 0.3 }
};

export default function RegisterOfficer() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '',
    officerId: '',
    email: '',
    contactNumber: '',
    station: '',
    role: 'Officer',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role') || sessionStorage.getItem('role');
    if (role !== 'Admin') {
      alert('Access Denied. Only Admins can access this page.');
      navigate('/login');
    }
  }, [navigate]);

  // Validation functions
  const validateContactNumber = (contactNumber) => {
    if (!contactNumber) {
      return 'Contact number is required';
    }
    if (!contactNumber.startsWith('07')) {
      return 'Contact number must start with 07';
    }
    if (contactNumber.length !== 10) {
      return 'Contact number must have exactly 10 characters';
    }
    if (!/^\d+$/.test(contactNumber)) {
      return 'Contact number must contain only digits';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    const contactError = validateContactNumber(data.contactNumber);
    if (contactError) {
      errors.contactNumber = contactError;
    }

    const passwordError = validatePassword(data.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    return errors;
  };

  const onChange = ({ target: { name, value } }) => {
    setData((d) => ({ ...d, [name]: value }));
    if (error) setError('');
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);
    setValidationErrors({});
    setError('');
    
    try {
      await axiosInstance.post('/officers', data);
      alert('Officer registered successfully');
      setData({
        name: '',
        officerId: '',
        email: '',
        contactNumber: '',
        station: '',
        role: 'Officer',
        username: '',
        password: ''
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const IconMap = {
    name: User,
    officerId: Server,
    email: Mail,
    contactNumber: Phone,
    station: Home,
    username: User,
    password: Key
  };

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
    
    <div
      className="relative min-h-screen flex items-center justify-center bg-white"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      

      <motion.div
        className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200 z-10"
        animate={error ? shake : undefined}
      >
        {/* Side Panel */}
        <div className="hidden md:flex md:w-1/3 bg-[#0B214A] p-8 flex-col justify-center text-white">
          <h2 className="text-2xl font-bold text-center">Welcome, Admin</h2>
          <p className="mt-2 text-center text-yellow-300">
            Create officer accounts efficiently and securely.
          </p>
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-2/3 p-6 md:p-8 bg-white">
          <h3 className="text-2xl font-bold text-[#0B214A] mb-6">Register New Officer</h3>

          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

          <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, type, options }) => {
              const Icon = IconMap[key];
              return (
                <div key={key} className="col-span-full sm:col-span-1">
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {label}
                  </label>
                  <div className={`flex items-center bg-gray-100 rounded-md border px-3 py-2 focus-within:ring-2 ${
                    validationErrors[key] 
                      ? 'border-red-400 focus-within:ring-red-300' 
                      : 'border-gray-300 focus-within:ring-yellow-400'
                  }`}>
                    {Icon && <Icon className="text-gray-500 mr-2" size={16} />}
                    {type === 'select' ? (
                      <select
                        id={key}
                        name={key}
                        value={data[key]}
                        onChange={onChange}
                        className="w-full bg-transparent text-gray-700 text-sm outline-none"
                        required
                      >
                        {options.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={key}
                        name={key}
                        type={type}
                        value={data[key]}
                        onChange={onChange}
                        placeholder={label}
                        className="w-full bg-transparent text-gray-700 text-sm placeholder-gray-400 outline-none"
                        required
                      />
                    )}
                  </div>
                  {validationErrors[key] && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors[key]}</p>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={loading}
              className="col-span-full mt-4 bg-[#FFD700] hover:bg-[#e5c200] text-[#0B214A] font-semibold py-2 rounded-md transition"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Register Officer'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Police360
          </p>
        </div>
      </motion.div>
    </div>
  );
}
