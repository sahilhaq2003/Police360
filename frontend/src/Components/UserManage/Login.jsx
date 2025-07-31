import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import loginBg from '../../assets/loginbg.jpg';

const shakeAnimation = {
  x: [0, -6, 6, -6, 6, 0],
  transition: { duration: 0.3 }
};

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      const { token, officer } = res.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('role', officer.role);
      navigate(
        officer.role === 'Admin'
          ? '/admin/register-officer'
          : '/dashboard'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const { username, password } = formData;

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center bg-black"
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black opacity-75" />
      <motion.div
        className="relative bg-gray-900 bg-opacity-85 rounded-lg shadow-lg backdrop-blur-sm w-full max-w-sm p-6"
        animate={error ? shakeAnimation : { x: 0 }}
      >
        <div className="text-center mb-4">
          <img src="/police-badge.png" alt="Badge" className="h-12 mx-auto filter brightness-0 invert" />
          <h1 className="mt-2 text-xl font-semibold text-gray-100">Police360</h1>
          <p className="text-gray-400 text-xs">Officer Login</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 text-red-400 text-xs text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Username</label>
            <div className={`flex items-center rounded-md px-2 py-1.5 transition-colors ${
              username ? 'bg-gray-700 border border-indigo-500' : 'bg-gray-800 border border-gray-700'
            } focus-within:ring-1 focus-within:ring-indigo-500`}
            >
              <User className={`text-sm ${username ? 'text-indigo-400' : 'text-gray-500'}`} />
              <input
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full ml-2 text-gray-200 placeholder-gray-500 bg-transparent outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Password</label>
            <div className={`flex items-center rounded-md px-2 py-1.5 transition-colors ${
              password ? 'bg-gray-700 border border-indigo-500' : 'bg-gray-800 border border-gray-700'
            } focus-within:ring-1 focus-within:ring-indigo-500`}
            >
              <Lock className={`text-sm ${password ? 'text-indigo-400' : 'text-gray-500'}`} />
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full ml-2 text-gray-200 placeholder-gray-500 bg-transparent outline-none text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-1 text-gray-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-3 w-3 text-indigo-500 rounded bg-gray-800 border-gray-600"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-indigo-400 hover:underline text-xs"
            >
              Forgot?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-gray-500">
          &copy; {new Date().getFullYear()} Police360.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
