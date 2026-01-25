import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';
import axios from 'axios';
import { 
  FaUser, FaIdCard, FaPhone, FaHome, FaCamera, FaCheckCircle, 
  FaTimesCircle, FaClock, FaMoneyBillWave, FaCalendarAlt, 
  FaFileAlt, FaEdit, FaExclamationTriangle, FaMapMarkerAlt,
  FaRuler, FaShieldAlt, FaHashtag, FaExchangeAlt
} from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const webcamRef = useRef(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState(location.state?.message || null);

  // Separate approved lands from pending registrations
  const approvedLands = registrations.filter(r => r.status === 'APPROVED' || r.status === 'REGISTERED_ON_BLOCKCHAIN');
  const pendingRegistrations = registrations.filter(r => r.status !== 'APPROVED' && r.status !== 'REJECTED' && r.status !== 'REGISTERED_ON_BLOCKCHAIN');
  const rejectedRegistrations = registrations.filter(r => r.status === 'REJECTED');

  useEffect(() => {
    fetchRegistrations();
    if (location.state?.showRegistrations) {
      setActiveTab('registrations');
    }
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/api/land-registration/my-registrations',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setRegistrations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedPhoto(imageSrc);
    setShowCamera(false);
  };

  const saveProfilePhoto = async () => {
    if (!capturedPhoto) return;
    
    setLoading(true);
    try {
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      const file = new File([blob], 'profile_photo.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const result = await axios.post(
        'http://localhost:3000/api/auth/update-profile-photo',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (result.data.success) {
        updateUser({ ...user, profilePhoto: result.data.profilePhoto });
        alert('Profile photo updated successfully!');
        setCapturedPhoto(null);
      }
    } catch (error) {
      alert('Error updating photo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-800',
      'PENDING_MEETING': 'bg-orange-100 text-orange-800',
      'MEETING_SCHEDULED': 'bg-blue-100 text-blue-800',
      'MEETING_COMPLETED': 'bg-indigo-100 text-indigo-800',
      'DOCUMENTS_VERIFIED': 'bg-purple-100 text-purple-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'REGISTERED_ON_BLOCKCHAIN': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOwnershipStatusColor = (status) => {
    const colors = {
      'OWNED': 'bg-green-100 text-green-800',
      'TRANSFERRED': 'bg-purple-100 text-purple-800',
      'DISPUTED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handlePayNow = (registration) => {
    navigate('/payment', {
      state: {
        landRegistration: registration,
        landRegistrationId: registration._id
      }
    });
  };

  // Check verification status from user data
  const getVerificationStatus = (field) => {
    if (field === 'aadhaar') return user?.aadhaarVerified || false;
    if (field === 'pan') return user?.panVerified || false;
    if (field === 'mobile') return user?.mobileVerified || false;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Message Alert */}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {message}
              <button onClick={() => setMessage(null)} className="float-right font-bold">&times;</button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center font-semibold whitespace-nowrap ${
                  activeTab === 'profile' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaUser className="inline mr-2" />
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('lands')}
                className={`flex-1 py-4 px-6 text-center font-semibold whitespace-nowrap ${
                  activeTab === 'lands' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaMapMarkerAlt className="inline mr-2" />
                My Lands
                {approvedLands.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {approvedLands.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`flex-1 py-4 px-6 text-center font-semibold whitespace-nowrap ${
                  activeTab === 'registrations' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaFileAlt className="inline mr-2" />
                Pending Registrations
                {pendingRegistrations.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    {pendingRegistrations.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`flex-1 py-4 px-6 text-center font-semibold whitespace-nowrap ${
                  activeTab === 'verification' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaIdCard className="inline mr-2" />
                KYC Status
              </button>
            </div>
          </div>

          {/* ==================== PROFILE TAB ==================== */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
              
              {/* Profile Photo Section */}
              <div className="flex items-start mb-8">
                <div className="mr-6">
                  {user?.profilePhoto || capturedPhoto ? (
                    <img
                      src={capturedPhoto || `http://localhost:3000/${user.profilePhoto}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{user?.fullName || 'N/A'}</h3>
                  
                  {/* User ID - Important! */}
                  <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    <FaHashtag className="inline mr-1" />
                    User ID: {user?.userId || 'N/A'}
                  </div>

                  <div className="mt-4">
                    {!showCamera && !capturedPhoto && (
                      <button
                        onClick={() => setShowCamera(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                      >
                        <FaCamera className="mr-2" />
                        {user?.profilePhoto ? 'Update Photo' : 'Add Photo'}
                      </button>
                    )}

                    {showCamera && (
                      <div className="mb-4">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-64 rounded-lg mb-2"
                        />
                        <div className="flex space-x-2">
                          <button onClick={capturePhoto} className="bg-green-600 text-white px-4 py-2 rounded">
                            Capture
                          </button>
                          <button onClick={() => setShowCamera(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {capturedPhoto && (
                      <div className="flex space-x-2">
                        <button onClick={saveProfilePhoto} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
                          {loading ? 'Saving...' : 'Save Photo'}
                        </button>
                        <button onClick={() => { setCapturedPhoto(null); setShowCamera(true); }} className="bg-gray-400 text-white px-4 py-2 rounded">
                          Retake
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaHashtag className="text-blue-600 text-xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-semibold text-blue-600">{user?.userId || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaUser className="text-blue-600 text-xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold">{user?.fullName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-blue-600 text-xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Aadhaar Number</p>
                    <p className="font-semibold">
                      {user?.aadhaarNumber 
                        ? `XXXX XXXX ${user.aadhaarNumber.slice(-4)}` 
                        : 'N/A'}
                      {getVerificationStatus('aadhaar') && (
                        <FaCheckCircle className="inline ml-2 text-green-600" />
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-orange-600 text-xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="font-semibold">
                      {user?.panNumber || 'N/A'}
                      {getVerificationStatus('pan') && (
                        <FaCheckCircle className="inline ml-2 text-green-600" />
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaPhone className="text-green-600 text-xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile Number</p>
                    <p className="font-semibold">
                      {user?.mobileNumber || 'N/A'}
                      {getVerificationStatus('mobile') && (
                        <FaCheckCircle className="inline ml-2 text-green-600" />
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-purple-600 text-xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-semibold">
                      {user?.dateOfBirth 
                        ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') 
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg col-span-1 md:col-span-2">
                  <FaHome className="text-blue-600 text-xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold">
                      {user?.address 
                        ? `${user.address.street || ''} ${user.address.village || ''}, ${user.address.city || ''}, ${user.address.district || ''}, ${user.address.state || ''} - ${user.address.pincode || ''}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{approvedLands.length}</p>
                  <p className="text-sm text-gray-600">Owned Lands</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{pendingRegistrations.length}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">{rejectedRegistrations.length}</p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== MY LANDS TAB ==================== */}
          {activeTab === 'lands' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">My Approved Lands</h2>
                <p className="text-gray-600">Lands that have been verified and approved by the authority</p>
              </div>

              {loadingRegistrations ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your lands...</p>
                </div>
              ) : approvedLands.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <FaMapMarkerAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No approved lands yet</p>
                  <button
                    onClick={() => navigate('/register-land')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Register New Land
                  </button>
                </div>
              ) : (
                approvedLands.map((land) => (
                  <div key={land._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Land Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold flex items-center">
                            <FaHashtag className="mr-2" />
                            {land.landId || 'Pending ID'}
                          </h3>
                          <p className="text-green-100">Survey No: {land.surveyNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getOwnershipStatusColor(land.ownershipStatus || 'OWNED')}`}>
                            {land.ownershipStatus || 'OWNED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Land Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaUser className="mr-1" /> Owner
                          </p>
                          <p className="font-semibold">{land.claimedOwnerName}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaHashtag className="mr-1" /> User ID
                          </p>
                          <p className="font-semibold text-blue-600">{user?.userId || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-500 flex items-center">
                            <FaCalendarAlt className="mr-1" /> Approved On
                          </p>
                          <p className="font-semibold">
                            {land.approvedAt 
                              ? new Date(land.approvedAt).toLocaleDateString('en-IN') 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-600 flex items-center mb-1">
                          <FaMapMarkerAlt className="mr-1" /> Location
                        </p>
                        <p className="font-semibold">
                          {land.address?.village}, {land.address?.district}, {land.address?.state} - {land.address?.pincode}
                        </p>
                      </div>

                      {/* Measurements */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-500">Sq. Feet</p>
                          <p className="font-bold text-lg">{land.measurements?.squareFeet || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-500">Sq. Meters</p>
                          <p className="font-bold text-lg">{land.measurements?.squareMeters || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-500">Acres</p>
                          <p className="font-bold text-lg">{land.measurements?.acres || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-500">Hectares</p>
                          <p className="font-bold text-lg">{land.measurements?.hectares || 0}</p>
                        </div>
                      </div>

                      {/* ZKP Information */}
                      {land.documentVerification?.zkpEnabled && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                          <h4 className="font-bold text-purple-800 flex items-center mb-2">
                            <FaShieldAlt className="mr-2" />
                            Zero Knowledge Proof Verification
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {land.documentVerification.zkpHashIds?.landDocumentZkpId && (
                              <div className="flex items-center">
                                <span className="text-purple-600">Land Doc:</span>
                                <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                                  {land.documentVerification.zkpHashIds.landDocumentZkpId}
                                </span>
                              </div>
                            )}
                            {land.documentVerification.zkpHashIds?.ownerLivePhotoZkpId && (
                              <div className="flex items-center">
                                <span className="text-purple-600">Photo:</span>
                                <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                                  {land.documentVerification.zkpHashIds.ownerLivePhotoZkpId}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-purple-600 mt-2">
                            Verified on: {new Date(land.documentVerification.verifiedAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(land.status)}`}>
                          {land.status?.replace(/_/g, ' ')}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 flex items-center">
                          <FaExchangeAlt className="mr-1" />
                          Transfer Land
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ==================== PENDING REGISTRATIONS TAB ==================== */}
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Pending Registrations</h2>
                <p className="text-gray-600">Track the status of your land registration applications</p>
              </div>

              {loadingRegistrations ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : pendingRegistrations.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <FaFileAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No pending registrations</p>
                  <button
                    onClick={() => navigate('/register-land')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Register New Land
                  </button>
                </div>
              ) : (
                pendingRegistrations.map((reg) => (
                  <div key={reg._id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">Survey No: {reg.surveyNumber || 'Draft'}</h3>
                        <p className="text-sm text-gray-500">
                          {reg.address?.village}, {reg.address?.district}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(reg.status)}`}>
                        {reg.status?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-semibold">{reg.registrationType?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Area</p>
                        <p className="font-semibold">{reg.measurements?.squareFeet || 0} sq.ft</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-semibold">
                          {reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Payment</p>
                          <p className={`font-semibold ${reg.payment?.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {reg.payment?.status || 'PENDING'}
                          </p>
                        </div>
                        <p className="font-bold">₹ {reg.payment?.totalAmount?.toFixed(2) || '0.00'}</p>
                      </div>

                      {reg.status === 'PENDING_PAYMENT' && reg.payment?.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handlePayNow(reg)}
                          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                        >
                          <FaMoneyBillWave className="inline mr-2" />
                          Pay Now
                        </button>
                      )}
                    </div>

                    {/* Meeting Info */}
                    {reg.meeting?.scheduledDate && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm text-gray-500">Meeting</p>
                        <p className="font-semibold text-blue-600">
                          {new Date(reg.meeting.scheduledDate).toLocaleDateString('en-IN')} at {reg.meeting.scheduledTime}
                        </p>
                        <p className="text-sm text-gray-500">Venue: {reg.meeting.venue}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ==================== KYC STATUS TAB ==================== */}
          {activeTab === 'verification' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">KYC Verification Status</h2>
              
              <div className="space-y-4">
                {/* Aadhaar */}
                <div className={`p-4 rounded-lg border-2 ${
                  getVerificationStatus('aadhaar') ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FaIdCard className="text-2xl mr-4 text-blue-600" />
                      <div>
                        <h3 className="font-bold">Aadhaar Verification</h3>
                        <p className="text-sm text-gray-600">
                          {user?.aadhaarNumber ? `XXXX XXXX ${user.aadhaarNumber.slice(-4)}` : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {getVerificationStatus('aadhaar') ? (
                      <span className="flex items-center text-green-600 font-semibold">
                        <FaCheckCircle className="mr-2" /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate('/signup', { state: { step: 1, reVerify: true } })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                      >
                        <FaEdit className="inline mr-2" /> Verify Now
                      </button>
                    )}
                  </div>
                </div>

                {/* PAN */}
                <div className={`p-4 rounded-lg border-2 ${
                  getVerificationStatus('pan') ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FaIdCard className="text-2xl mr-4 text-orange-600" />
                      <div>
                        <h3 className="font-bold">PAN Verification</h3>
                        <p className="text-sm text-gray-600">{user?.panNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    {getVerificationStatus('pan') ? (
                      <span className="flex items-center text-green-600 font-semibold">
                        <FaCheckCircle className="mr-2" /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate('/signup', { state: { step: 2, reVerify: true } })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                      >
                        <FaEdit className="inline mr-2" /> Verify Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div className={`p-4 rounded-lg border-2 ${
                  getVerificationStatus('mobile') ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FaPhone className="text-2xl mr-4 text-green-600" />
                      <div>
                        <h3 className="font-bold">Mobile Verification</h3>
                        <p className="text-sm text-gray-600">{user?.mobileNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    {getVerificationStatus('mobile') ? (
                      <span className="flex items-center text-green-600 font-semibold">
                        <FaCheckCircle className="mr-2" /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate('/signup', { state: { step: 3, reVerify: true } })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                      >
                        <FaEdit className="inline mr-2" /> Verify Now
                      </button>
                    )}
                  </div>
                </div>

                {/* Overall Status */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h3 className="font-bold mb-2">Overall KYC Status</h3>
                  {getVerificationStatus('aadhaar') && getVerificationStatus('pan') && getVerificationStatus('mobile') ? (
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="text-2xl mr-3" />
                      <span className="font-semibold">All verifications complete!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <FaExclamationTriangle className="text-2xl mr-3" />
                      <span>Please complete all verifications to register lands.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
