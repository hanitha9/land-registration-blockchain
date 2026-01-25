import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserTie, FaSignOutAlt, FaList, FaCheckCircle, FaTimesCircle, 
  FaClock, FaCalendarAlt, FaFileAlt, FaIdCard, FaMapMarkerAlt,
  FaRuler, FaMoneyBillWave, FaEye, FaCheck, FaTimes, FaHashtag
} from 'react-icons/fa';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingData, setMeetingData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    venue: ''
  });
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const authorityUser = JSON.parse(localStorage.getItem('authorityUser') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !authorityUser.role || authorityUser.role !== 'AUTHORITY') {
      navigate('/authority/login');
      return;
    }
    fetchData();
  }, [activeTab]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await axios.get(
        'http://localhost:3000/api/authority/dashboard/stats',
        getAuthHeaders()
      );
      setStats(statsRes.data.data);

      // Fetch registrations based on active tab
      let url = 'http://localhost:3000/api/authority/registrations';
      if (activeTab === 'pending') {
        url = 'http://localhost:3000/api/authority/registrations/pending';
      } else if (activeTab !== 'all') {
        url = `http://localhost:3000/api/authority/registrations?status=${activeTab}`;
      }

      const regRes = await axios.get(url, getAuthHeaders());
      setRegistrations(regRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authorityUser');
    navigate('/login');
  };

  const viewDetails = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/authority/registrations/${id}`,
        getAuthHeaders()
      );
      setSelectedRegistration(res.data.data);
    } catch (error) {
      alert('Error fetching details: ' + error.message);
    }
  };

  const scheduleMeeting = async (id) => {
    if (!meetingData.scheduledDate || !meetingData.scheduledTime || !meetingData.venue) {
      alert('Please fill all meeting details');
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/authority/registrations/${id}/schedule-meeting`,
        meetingData,
        getAuthHeaders()
      );
      alert('✅ Meeting scheduled successfully!');
      setShowMeetingModal(false);
      setMeetingData({ scheduledDate: '', scheduledTime: '', venue: '' });
      fetchData();
      setSelectedRegistration(null);
    } catch (error) {
      alert('Error scheduling meeting: ' + error.response?.data?.message);
    }
  };

  const completeMeeting = async (id) => {
    const notes = prompt('Enter meeting notes (optional):');
    try {
      await axios.post(
        `http://localhost:3000/api/authority/registrations/${id}/complete-meeting`,
        { notes },
        getAuthHeaders()
      );
      alert('✅ Meeting marked as completed!');
      fetchData();
      setSelectedRegistration(null);
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const verifyDocuments = async (id) => {
    if (!verificationNotes) {
      alert('Please enter verification notes');
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/authority/registrations/${id}/verify-documents`,
        { verificationNotes },
        getAuthHeaders()
      );
      alert('✅ Documents verified with ZKP!');
      setVerificationNotes('');
      fetchData();
      setSelectedRegistration(null);
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const generateLandId = async (id) => {
    if (!window.confirm('Are you sure you want to generate Land ID and approve this registration?')) {
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3000/api/authority/registrations/${id}/generate-land-id`,
        {},
        getAuthHeaders()
      );
      alert(`✅ Land ID Generated: ${res.data.data.landId}`);
      fetchData();
      setSelectedRegistration(null);
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const rejectRegistration = async (id) => {
    if (!rejectionReason) {
      alert('Please enter rejection reason');
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/authority/registrations/${id}/reject`,
        { rejectionReason },
        getAuthHeaders()
      );
      alert('❌ Registration rejected');
      setRejectionReason('');
      fetchData();
      setSelectedRegistration(null);
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
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
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaUserTie className="text-2xl" />
            <div>
              <h1 className="text-xl font-bold">Authority Dashboard</h1>
              <p className="text-sm text-purple-200">Welcome, {authorityUser.fullName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <FaList className="text-3xl text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <FaMoneyBillWave className="text-3xl text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.pendingPayment}</p>
              <p className="text-sm text-gray-600">Pending Payment</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <FaCalendarAlt className="text-3xl text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.pendingMeeting}</p>
              <p className="text-sm text-gray-600">Pending Meeting</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <FaFileAlt className="text-3xl text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.pendingVerification}</p>
              <p className="text-sm text-gray-600">Pending Verification</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <FaCheckCircle className="text-3xl text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <FaTimesCircle className="text-3xl text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'PENDING_PAYMENT', label: 'Payment Pending' },
              { key: 'PENDING_MEETING', label: 'Meeting Pending' },
              { key: 'MEETING_SCHEDULED', label: 'Meeting Scheduled' },
              { key: 'MEETING_COMPLETED', label: 'Meeting Done' },
              { key: 'DOCUMENTS_VERIFIED', label: 'Verified' },
              { key: 'APPROVED', label: 'Approved' },
              { key: 'REJECTED', label: 'Rejected' },
              { key: 'all', label: 'All' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 font-semibold whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Registrations List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">Registrations ({registrations.length})</h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : registrations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No registrations found</div>
              ) : (
                registrations.map(reg => (
                  <div
                    key={reg._id}
                    onClick={() => viewDetails(reg._id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedRegistration?._id === reg._id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{reg.surveyNumber || 'No Survey #'}</p>
                        <p className="text-sm text-gray-600">{reg.claimedOwnerName}</p>
                        <p className="text-xs text-gray-500">
                          {reg.address?.village}, {reg.address?.district}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(reg.status)}`}>
                        {reg.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {reg.landId && (
                      <p className="text-xs text-green-600 mt-1">
                        <FaHashtag className="inline" /> {reg.landId}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-white rounded-lg shadow">
            {selectedRegistration ? (
              <div className="p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                  <span>Registration Details</span>
                  <span className={`px-3 py-1 rounded text-sm ${getStatusColor(selectedRegistration.status)}`}>
                    {selectedRegistration.status?.replace(/_/g, ' ')}
                  </span>
                </h2>

                {/* Land ID if generated */}
                {selectedRegistration.landId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-green-800 font-bold">
                      <FaHashtag className="inline mr-1" />
                      Land ID: {selectedRegistration.landId}
                    </p>
                  </div>
                )}

                {/* User Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FaIdCard className="mr-2 text-blue-600" /> Owner Details
                  </h3>
                  <p><strong>Name:</strong> {selectedRegistration.claimedOwnerName}</p>
                  <p><strong>Aadhaar:</strong> {selectedRegistration.userId?.aadhaarNumber}</p>
                  <p><strong>Mobile:</strong> {selectedRegistration.userId?.mobileNumber}</p>
                  <p><strong>Email:</strong> {selectedRegistration.userId?.email || 'N/A'}</p>
                </div>

                {/* Land Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-600" /> Land Details
                  </h3>
                  <p><strong>Survey #:</strong> {selectedRegistration.surveyNumber}</p>
                  <p><strong>Type:</strong> {selectedRegistration.registrationType}</p>
                  <p><strong>Location:</strong> {selectedRegistration.address?.village}, {selectedRegistration.address?.district}, {selectedRegistration.address?.state}</p>
                  <p><strong>Pincode:</strong> {selectedRegistration.address?.pincode}</p>
                </div>

                {/* Measurements */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FaRuler className="mr-2 text-orange-600" /> Measurements
                  </h3>
                  <p><strong>Sq. Feet:</strong> {selectedRegistration.measurements?.squareFeet}</p>
                  <p><strong>Sq. Meters:</strong> {selectedRegistration.measurements?.squareMeters}</p>
                  <p><strong>Acres:</strong> {selectedRegistration.measurements?.acres}</p>
                </div>

                {/* Payment Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FaMoneyBillWave className="mr-2 text-green-600" /> Payment
                  </h3>
                  <p><strong>Amount:</strong> ₹{selectedRegistration.payment?.totalAmount}</p>
                  <p><strong>Status:</strong> {selectedRegistration.payment?.status}</p>
                  {selectedRegistration.payment?.transactionId && (
                    <p><strong>Transaction ID:</strong> {selectedRegistration.payment?.transactionId}</p>
                  )}
                </div>

                {/* Documents */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FaFileAlt className="mr-2 text-purple-600" /> Documents
                  </h3>
                  {selectedRegistration.documents?.landDocument && (
                    <a 
                      href={`http://localhost:3000/${selectedRegistration.documents.landDocument}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      📄 Land Document
                    </a>
                  )}
                  {selectedRegistration.documents?.previousOwnerDocument && (
                    <a 
                      href={`http://localhost:3000/${selectedRegistration.documents.previousOwnerDocument}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      📄 Previous Owner Document
                    </a>
                  )}
                  {selectedRegistration.ownerLivePhoto && (
                    <a 
                      href={`http://localhost:3000/${selectedRegistration.ownerLivePhoto}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      📷 Owner Photo
                    </a>
                  )}
                </div>

                {/* ZKP Status */}
                {selectedRegistration.documentVerification?.zkpEnabled && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800">✅ Zero Knowledge Proof Enabled</h3>
                    <p className="text-sm text-purple-600">Documents verified and stored as cryptographic hashes</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 mt-4">
                  {/* Schedule Meeting */}
                  {(selectedRegistration.status === 'PENDING_MEETING' || selectedRegistration.status === 'PENDING_PAYMENT') && 
                   selectedRegistration.payment?.status === 'COMPLETED' && (
                    <button
                      onClick={() => setShowMeetingModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <FaCalendarAlt className="mr-2" /> Schedule Meeting
                    </button>
                  )}

                  {/* Complete Meeting */}
                  {selectedRegistration.status === 'MEETING_SCHEDULED' && (
                    <button
                      onClick={() => completeMeeting(selectedRegistration._id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <FaCheck className="mr-2" /> Mark Meeting Completed
                    </button>
                  )}

                  {/* Verify Documents */}
                  {selectedRegistration.status === 'MEETING_COMPLETED' && (
                    <div className="space-y-2">
                      <textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Enter verification notes..."
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="2"
                      />
                      <button
                        onClick={() => verifyDocuments(selectedRegistration._id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center"
                      >
                        <FaCheckCircle className="mr-2" /> Verify Documents (Generate ZKP)
                      </button>
                    </div>
                  )}

                  {/* Generate Land ID */}
                  {selectedRegistration.status === 'DOCUMENTS_VERIFIED' && (
                    <button
                      onClick={() => generateLandId(selectedRegistration._id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center"
                    >
                      <FaHashtag className="mr-2" /> Generate Land ID & Approve
                    </button>
                  )}

                  {/* Reject */}
                  {!['APPROVED', 'REJECTED'].includes(selectedRegistration.status) && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason (required)"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => rejectRegistration(selectedRegistration._id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" /> Reject Registration
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaEye className="text-4xl mx-auto mb-4" />
                <p>Select a registration to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Schedule Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={meetingData.scheduledDate}
                  onChange={(e) => setMeetingData({...meetingData, scheduledDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Time</label>
                <input
                  type="time"
                  value={meetingData.scheduledTime}
                  onChange={(e) => setMeetingData({...meetingData, scheduledTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Venue</label>
                <input
                  type="text"
                  value={meetingData.venue}
                  onChange={(e) => setMeetingData({...meetingData, venue: e.target.value})}
                  placeholder="Office address / Room number"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => scheduleMeeting(selectedRegistration._id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
