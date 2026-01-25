import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaIdCard, FaLock, FaUser, FaUserTie } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState(null); // null, 'user', 'authority'
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.aadhaarNumber, formData.password);
      alert('✅ Login successful!');
      navigate('/profile');
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorityClick = () => {
    navigate('/authority/login');
  };

  // Show login type selection
  if (loginType === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome</h1>
              <p className="text-gray-600">Choose how you want to login</p>
            </div>

            <div className="space-y-4">
              {/* User Login Option */}
              <button
                onClick={() => setLoginType('user')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-4"
              >
                <FaUser className="text-3xl" />
                <div className="text-left">
                  <p className="text-xl font-bold">User Login</p>
                  <p className="text-sm text-blue-200">Login with your Aadhaar number</p>
                </div>
              </button>

              {/* Authority Login Option */}
              <button
                onClick={handleAuthorityClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-4"
              >
                <FaUserTie className="text-3xl" />
                <div className="text-left">
                  <p className="text-xl font-bold">Authority Login</p>
                  <p className="text-sm text-purple-200">Login with Employee ID</p>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show user login form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaUser className="text-4xl text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Login</h1>
            <p className="text-gray-600">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <FaIdCard className="mr-2" />
                Aadhaar Number
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="123456789012"
                maxLength="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <FaLock className="mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:bg-gray-400 mb-4"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => setLoginType(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition duration-300"
            >
              ← Back to Options
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
