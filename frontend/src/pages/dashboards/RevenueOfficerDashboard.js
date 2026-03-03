import React, { useState, useEffect } from 'react';
import { revenueApi } from '../../services/revenueApi';
import { Link } from 'react-router-dom';

const RevenueOfficerDashboard = () => {
  const [stats, setStats] = useState({ totalLands: 0, activeLands: 0, lockedLands: 0, disputedLands: 0, pendingTransfers: 0 });
  const [recentLands, setRecentLands] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, landsRes, pendingRes] = await Promise.all([
        revenueApi.getStatistics(),
        revenueApi.getAllLands({ limit: 10 }),
        revenueApi.getPendingRegistrations()
      ]);
      setStats(statsRes.data.statistics);
      setRecentLands(landsRes.data.lands);
      setPendingRegistrations(pendingRes.data.lands);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (landId) => {
    setActionLoading(landId);
    try {
      const res = await revenueApi.approveLandRegistration({ landId });
      setMessage({ type: 'success', text: `✅ Land ${landId} approved and registered on blockchain! TxID: ${res.data.blockchainTxId?.substring(0, 20)}...` });
      setPendingRegistrations(prev => prev.filter(l => l.landId !== landId));
      fetchDashboardData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Approval failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.landId);
    try {
      await revenueApi.rejectLandRegistration({ landId: rejectModal.landId, reason: rejectReason });
      setMessage({ type: 'success', text: `Land ${rejectModal.landId} rejected.` });
      setPendingRegistrations(prev => prev.filter(l => l.landId !== rejectModal.landId));
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rejection failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = {
    ACTIVE: 'bg-green-100 text-green-800',
    LOCKED: 'bg-yellow-100 text-yellow-800',
    DISPUTED: 'bg-red-100 text-red-800',
    PENDING_TRANSFER: 'bg-blue-100 text-blue-800',
    PENDING_VERIFICATION: 'bg-orange-100 text-orange-800',
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Registration</h3>
            <p className="text-sm text-gray-500 mb-4">Land: {rejectModal.surveyNumber} ({rejectModal.landId})</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Officer Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage land records and registrations</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 ml-4">✕</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Lands', value: stats.totalLands },
          { label: 'Active', value: stats.activeLands },
          { label: 'Locked', value: stats.lockedLands },
          { label: 'Disputed', value: stats.disputedLands },
          { label: 'Pending Transfers', value: stats.pendingTransfers },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/create-land-record"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          + Create Land Record
        </Link>
        <Link to="/view-all-lands"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          View All Lands
        </Link>
        <Link to="/manage-disputes"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Manage Disputes
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'pending', label: `⏳ Pending Registrations ${pendingRegistrations.length > 0 ? `(${pendingRegistrations.length})` : ''}` },
            { id: 'recent', label: '📋 Recent Land Records' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Pending Registrations */}
      {activeTab === 'pending' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Land Registration Requests</h3>
            <p className="text-sm text-gray-500 mt-1">Approve to register on Hyperledger Fabric blockchain</p>
          </div>
          <div className="p-6">
            {pendingRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-gray-500 text-sm">No pending registrations</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Land ID', 'Survey No.', 'Owner', 'Location', 'Area', 'Value', 'Submitted', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingRegistrations.map(land => (
                      <tr key={land.landId} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-xs font-mono text-gray-500">{land.landId}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{land.surveyNumber}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div>{land.ownerName}</div>
                          <div className="text-xs text-gray-400">{land.ownerAadhaar}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{land.location?.district}, {land.location?.state}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{land.areaSqFt} sq.ft</td>
                        <td className="px-4 py-4 text-sm text-gray-500">₹{land.marketValue?.toLocaleString()}</td>
                        <td className="px-4 py-4 text-xs text-gray-400">{new Date(land.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Link to={`/land/${land.landId}`}
                              className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                              View
                            </Link>
                            <button
                              onClick={() => handleApprove(land.landId)}
                              disabled={actionLoading === land.landId}
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50">
                              {actionLoading === land.landId ? '⛓️...' : '✅ Approve'}
                            </button>
                            <button
                              onClick={() => setRejectModal(land)}
                              disabled={actionLoading === land.landId}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-50">
                              ❌ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Recent Land Records */}
      {activeTab === 'recent' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Land Records</h3>
          </div>
          <div className="p-6">
            {recentLands.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No land records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Survey No.', 'Owner', 'Location', 'Area', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLands.map(land => (
                      <tr key={land.landId} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{land.surveyNumber}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{land.ownerName}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{land.location?.district}, {land.location?.state}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{land.areaSqFt} sq.ft</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[land.currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                            {land.currentStatus?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/land/${land.landId}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueOfficerDashboard;