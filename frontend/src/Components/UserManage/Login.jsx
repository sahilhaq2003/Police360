import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, AlertCircle, ShieldX } from 'lucide-react';
import loginBg from '../../assets/loginbg.jpg';
import PLogo from '../../assets/PLogo.png'; // Custom logo

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'credentials' or 'deactivated'
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      setError('');
      setErrorType('');
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setErrorType('');
  
  try {
    const res = await axiosInstance.post('/auth/login', formData);
    const { token, officer } = res.data;
    
    if (!token || !officer) {
      setError('Invalid response from server. Please try again.');
      setErrorType('credentials');
      return;
    }
    
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Save all auth data
    storage.setItem('token', token);
    storage.setItem('role', officer.role);
    storage.setItem('userId', officer.id);
    storage.setItem('userName', officer.name);
    
    // Verify token was saved
    const savedToken = storage.getItem('token');
    if (!savedToken) {
      setError('Failed to save authentication. Please try again.');
      setErrorType('credentials');
      return;
    }
    
    // Small delay to ensure storage is committed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Route based on role
    if (officer.role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (officer.role === 'IT Officer') {
      navigate('/itOfficer/ItOfficerDashboard', { replace: true });
    } else {
      navigate('/officer/dashboard', { replace: true });
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Invalid credentials.';
    setError(errorMessage);
    
    // Determine error type for styling
    if (errorMessage.includes('deactivated')) {
      setErrorType('deactivated');
    } else {
      setErrorType('credentials');
    }
  } finally {
    setLoading(false);
  }
};

  const { username, password } = formData;

  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-gray-100 backdrop-blur-sm" />

      {/* Login Card */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-8 z-10 border border-gray-200">
        {/* Back to Home */}
        <div className="absolute left-4 top-4">
          <button onClick={() => navigate('/')} className="text-sm text-[#0B214A] bg-white border border-[#E4E9F2] px-3 py-1 rounded-md hover:bg-[#F5F7FB]">Back to Home</button>
        </div>
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0B214A] flex items-center justify-center shadow">
            <img src={PLogo} alt="Police360 Logo" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-[#0B214A]">Police360</h1>
          <p className="text-sm text-gray-500">Secure Officer Login</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-4 rounded-lg border-l-4 flex items-start gap-3 ${
            errorType === 'deactivated' 
              ? 'bg-red-50 border-red-400 text-red-800' 
              : 'bg-red-50 border-red-400 text-red-700'
          }`}>
            {errorType === 'deactivated' ? (
              <ShieldX className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{error}</p>
              {errorType === 'deactivated' && (
                <p className="text-xs text-red-600 mt-1">
                  If you believe this is an error, please contact your station administrator.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#0B214A] mb-1">Username</label>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#FFD700]">
              <User className="text-gray-400" size={18} />
              <input
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="ml-3 w-full bg-transparent outline-none text-gray-800 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#0B214A] mb-1">Password</label>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#FFD700]">
              <Lock className="text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="ml-3 w-full bg-transparent outline-none text-gray-800 text-sm"
                required
              />
            </div>
          </div>

          {/* Remember Me & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="accent-[#0B214A] h-4 w-4"
              />
              Remember Me
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-[#0B214A] hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 flex items-center justify-center bg-[#0B214A] hover:bg-[#132e63] text-white font-semibold text-sm rounded-md transition duration-200"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Police360. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
