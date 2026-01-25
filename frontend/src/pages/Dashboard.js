import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSearch, FaExchangeAlt, FaMapMarkerAlt, FaRuler, FaUser,
  FaHashtag, FaShieldAlt, FaCalendarAlt, FaPlus, FaEye
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLand, setSelectedLand] = useState(null);

  useEffect(() => {
    fetchMyLands();
  }, []);

  const fetchMyLands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:3000/api/land-registration/my-registrations',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Filter only approved lands
      const approvedLands = (response.data.data || []).filter(
        land => land.status === 'APPROVED' || land.status === 'REGISTERED_ON_BLOCKCHAIN'
      );
      setLands(approvedLands);
      setError(null);
    } catch (err) {
      setError('Failed to fetch lands. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLands = lands.filter(land =>
    land.landId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.claimedOwnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.surveyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.address?.village?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: lands.length,
    owned: lands.filter(l => l.ownershipStatus === 'OWNED' || !l.ownershipStatus).length,
    transferred: lands.filter(l => l.ownershipStatus === 'TRANSFERRED').length,
    totalArea: lands.reduce((sum, l) => sum + (l.measurements?.squareFeet || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your lands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Land Registry Dashboard</h1>
          <button
            onClick={() => navigate('/register-land')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" />
            Register New Land
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Total Lands</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FaMapMarkerAlt className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Owned</p>
                <p className="text-3xl font-bold text-green-600">{stats.owned}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FaUser className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Transferred</p>
                <p className="text-3xl font-bold text-purple-600">{stats.transferred}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FaExchangeAlt className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Total Area</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalArea.toLocaleString()}</p>
                <p className="text-xs text-gray-500">sq.ft</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <FaRuler className="text-orange-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex items-center">
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search by Land ID, Survey Number, Owner, or Location..."
              className="w-full outline-none text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lands Grid */}
        {filteredLands.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Approved Lands Yet</h3>
            <p className="text-gray-500 mb-6">Start by registering your first land property</p>
            <button
              onClick={() => navigate('/register-land')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Register New Land
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLands.map((land) => (
              <div 
                key={land._id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedLand(selectedLand?._id === land._id ? null : land)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-green-100 text-sm">Land ID</p>
                      <h3 className="text-xl font-bold">{land.landId || 'Pending'}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      land.ownershipStatus === 'TRANSFERRED' 
                        ? 'bg-purple-500' 
                        : 'bg-green-500'
                    }`}>
                      {land.ownershipStatus || 'OWNED'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FaHashtag className="mr-2 text-blue-600" />
                      <span className="text-sm">Survey: </span>
                      <span className="font-semibold ml-1">{land.surveyNumber}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-2 text-green-600" />
                      <span className="text-sm">Owner: </span>
                      <span className="font-semibold ml-1">{land.claimedOwnerName}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-red-600" />
                      <span className="text-sm truncate">
                        {land.address?.village}, {land.address?.district}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaRuler className="mr-2 text-orange-600" />
                      <span className="font-semibold">{land.measurements?.squareFeet?.toLocaleString() || 0}</span>
                      <span className="text-sm ml-1">sq.ft</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-purple-600" />
                      <span className="text-sm">Approved: </span>
                      <span className="font-semibold ml-1">
                        {land.approvedAt ? new Date(land.approvedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>

                    {/* ZKP Badge */}
                    {land.documentVerification?.zkpEnabled && (
                      <div className="flex items-center text-purple-600 bg-purple-50 rounded p-2">
                        <FaShieldAlt className="mr-2" />
                        <span className="text-sm font-semibold">ZKP Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {selectedLand?._id === land._id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">ZKP Hash IDs</h4>
                      {land.documentVerification?.zkpHashIds && (
                        <div className="space-y-1 text-sm">
                          {land.documentVerification.zkpHashIds.landDocumentZkpId && (
                            <p className="font-mono bg-gray-100 p-1 rounded">
                              📄 {land.documentVerification.zkpHashIds.landDocumentZkpId}
                            </p>
                          )}
                          {land.documentVerification.zkpHashIds.ownerLivePhotoZkpId && (
                            <p className="font-mono bg-gray-100 p-1 rounded">
                              📷 {land.documentVerification.zkpHashIds.ownerLivePhotoZkpId}
                            </p>
                          )}
                        </div>
                      )}

                      <h4 className="font-semibold mt-3 mb-2">Surrounding Lands</h4>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <p>North: {land.surroundingLands?.north || 'N/A'}</p>
                        <p>South: {land.surroundingLands?.south || 'N/A'}</p>
                        <p>East: {land.surroundingLands?.east || 'N/A'}</p>
                        <p>West: {land.surroundingLands?.west || 'N/A'}</p>
                      </div>

                      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center">
                        <FaExchangeAlt className="mr-2" />
                        Transfer Ownership
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {land.measurements?.acres?.toFixed(2) || 0} Acres
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
                    <FaEye className="mr-1" />
                    {selectedLand?._id === land._id ? 'Less' : 'More'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
