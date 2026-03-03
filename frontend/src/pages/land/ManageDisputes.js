import React, { useState, useEffect } from 'react';
import { revenueApi } from '../../services/revenueApi';
import { Link } from 'react-router-dom';

const ManageDisputes = () => {
  const [disputedLands, setDisputedLands] = useState([]);
  const [allLands, setAllLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [disputeModal, setDisputeModal] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveReason, setResolveReason] = useState('');
  const [activeTab, setActiveTab] = useState('disputed');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await revenueApi.getAllLands({ limit: 100 });
      const lands = res.data.lands;
      setAllLands(lands);
      setDisputedLands(lands.filter(l => l.currentStatus === 'DISPUTED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDisputed = async () => {
    if (!disputeModal) return;
    setActionLoading(disputeModal.landId);
    try {
      await revenueApi.markLandDisputed({ landId: disputeModal.landId, reason: disputeReason });
      setMessage({ type: 'success', text: `Land ${disputeModal.landId} marked as disputed` });
      setDisputeModal(null);
      setDisputeReason('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to mark disputed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveDispute = async () => {
    if (!resolveModal) return;
    setActionLoading(resolveModal.landId);
    try {
      await revenueApi.resolveLandDispute({ landId: resolveModal.landId, resolution: resolveReason });
      setMessage({ type: 'success', text: `Dispute resolved for land ${resolveModal.landId}` });
      setResolveModal(null);
      setResolveReason('');
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to resolve dispute' });
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = {
    ACTIVE:               'bg-green-100 text-green-800',
    LOCKED:               'bg-yellow-100 text-yellow-800',
    DISPUTED:             'bg-red-100 text-red-800',
    PENDING_TRANSFER:     'bg-blue-100 text-blue-800',
    PENDING_VERIFICATION: 'bg-orange-100 text-orange-800',
  };

  const activeLands = allLands.filter(l => ['ACTIVE', 'LOCKED'].includes(l.currentStatus));

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Mark Disputed Modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Mark Land as Disputed</h3>
            <p className="text-sm text-gray-500 mb-4">{disputeModal.surveyNumber} — {disputeModal.ownerName}</p>
            <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
              placeholder="Enter dispute reason..." rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setDisputeModal(null); setDisputeReason(''); }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleMarkDisputed} disabled={!disputeReason || actionLoading}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Mark Disputed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Resolve Dispute</h3>
            <p className="text-sm text-gray-500 mb-4">{resolveModal.surveyNumber} — {resolveModal.ownerName}</p>
            <textarea value={resolveReason} onChange={e => setResolveReason(e.target.value)}
              placeholder="Enter resolution details..." rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setResolveModal(null); setResolveReason(''); }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleResolveDispute} disabled={!resolveReason || actionLoading}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Resolve Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">Mark lands as disputed or resolve existing disputes</p>
        </div>
        <Link to="/revenue-dashboard" className="text-indigo-600 hover:underline text-sm">← Back to Dashboard</Link>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex justify-between">
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'disputed', label: `⚠️ Disputed Lands (${disputedLands.length})` },
            { id: 'mark', label: `🚩 Mark as Disputed` },
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

      {/* Disputed Lands Tab */}
      {activeTab === 'disputed' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Currently Disputed Lands</h3>
          </div>
          <div className="p-6">
            {disputedLands.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-sm">No disputed lands</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Land ID', 'Survey No.', 'Owner', 'Location', 'Dispute Reason', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {disputedLands.map(land => (
                      <tr key={land.landId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-400">{land.landId}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{land.surveyNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{land.ownerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{land.location?.district}, {land.location?.state}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{land.disputeDetails?.reason || land.rejectionReason || 'Not specified'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link to={`/land/${land.landId}`}
                              className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50">View</Link>
                            <button onClick={() => setResolveModal(land)}
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                              ✅ Resolve
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

      {/* Mark as Disputed Tab */}
      {activeTab === 'mark' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Mark Active Land as Disputed</h3>
            <p className="text-sm text-gray-500 mt-1">Select a land to flag for legal dispute — this will freeze all transactions</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Land ID', 'Survey No.', 'Owner', 'Location', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeLands.map(land => (
                    <tr key={land.landId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{land.landId}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{land.surveyNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{land.ownerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{land.location?.district}, {land.location?.state}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[land.currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {land.currentStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link to={`/land/${land.landId}`}
                            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50">View</Link>
                          <button onClick={() => setDisputeModal(land)}
                            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded font-medium">
                            🚩 Mark Disputed
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDisputes;