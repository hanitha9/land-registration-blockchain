import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaUserTie, FaLock, FaIdBadge } from 'react-icons/fa';

const AuthorityLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/authority/login', {
        employeeId: formData.employeeId,
        password: formData.password
      });

      if (response.data.success) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('authorityUser', JSON.stringify(response.data.user));
        
        alert('✅ Authority login successful!');
        navigate('/authority/dashboard');
      }
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <FaUserTie className="text-4xl text-purple-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Authority Login</h1>
            <p className="text-gray-600">Land Registry Authority Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                <FaIdBadge className="mr-2" />
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="AUTH001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:bg-gray-400 mb-4"
            >
              {loading ? 'Logging in...' : 'Login as Authority'}
            </button>

            <Link
              to="/login"
              className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition duration-300"
            >
              ← Back to Login Options
            </Link>
          </form>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800 text-center">
              <strong>Note:</strong> This portal is only for authorized Land Registry officials.
              Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;
