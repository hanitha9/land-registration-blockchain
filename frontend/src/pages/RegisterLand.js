import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { landService } from '../services/api';
import { FaHome, FaUser, FaRuler, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

const RegisterLand = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    landId: '',
    ownerName: '',
    area: '',
    location: '',
    marketValue: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.landId || !formData.ownerName || !formData.area || !formData.location || !formData.marketValue) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await landService.registerLand(formData);
      alert('Land registered successfully on blockchain!');
      console.log(response);
      
      // Reset form
      setFormData({
        landId: '',
        ownerName: '',
        area: '',
        location: '',
        marketValue: '',
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to register land: ' + (error.response?.data?.message || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8">
              <h1 className="text-3xl font-bold flex items-center">
                <FaHome className="mr-3" />
                Register New Land
              </h1>
              <p className="mt-2 text-blue-100">
                Add a new land record to the blockchain
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Land ID */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaHome className="inline mr-2" />
                  Land ID
                </label>
                <input
                  type="text"
                  name="landId"
                  value={formData.landId}
                  onChange={handleChange}
                  placeholder="e.g., LAND001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Unique identifier for the land</p>
              </div>

              {/* Owner Name */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaUser className="inline mr-2" />
                  Owner Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>

              {/* Area */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaRuler className="inline mr-2" />
                  Area
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., 1000 sq meters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Location
                </label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Plot 123, Sector 5, City Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  rows="3"
                  required
                />
              </div>

              {/* Market Value */}
              <div className="mb-8">
                <label className="block text-gray-700 font-semibold mb-2">
                  <FaDollarSign className="inline mr-2" />
                  Market Value (₹)
                </label>
                <input
                  type="number"
                  name="marketValue"
                  value={formData.marketValue}
                  onChange={handleChange}
                  placeholder="e.g., 5000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering on Blockchain...' : 'Register Land'}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h3 className="font-bold text-blue-900 mb-2">📝 Important Information</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>All information will be recorded on the blockchain</li>
              <li>Records are immutable and cannot be altered</li>
              <li>Land ID must be unique</li>
              <li>Transaction will be verified by multiple peers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterLand;
