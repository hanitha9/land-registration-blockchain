import React, { useState, useEffect } from 'react';
import { registrarApi } from '../../services/registrarApi';
import { Link } from 'react-router-dom';

const SubRegistrarDashboard = () => {
  const [stats, setStats] = useState({ pendingTransfers: 0, approvedToday: 0, rejectedToday: 0, blockedFraud: 0 });
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [historyTransfers, setHistoryTransfers] = useState([]);
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
      const [pendingRes, historyRes] = await Promise.all([
        registrarApi.getPendingTransfers(),
        registrarApi.getTransferHistory()
      ]);

      const pending = pendingRes.data.transfers;
      const history = historyRes.data.transfers;
      setPendingTransfers(pending);
      setHistoryTransfers(history);

      const today = new Date().toDateString();
      setStats({
        pendingTransfers: pending.length,
        approvedToday: history.filter(t => t.status === 'APPROVED' && new Date(t.completedDate).toDateString() === today).length,
        rejectedToday: history.filter(t => t.status === 'REJECTED' && new Date(t.completedDate).toDateString() === today).length,
        blockedFraud: history.filter(t => t.status === 'BLOCKED').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transferId) => {
    setActionLoading(transferId);
    try {
      const res = await registrarApi.approveTransfer({ transferId });
      setMessage({ type: 'success', text: `✅ Transfer approved! Blockchain TxID: ${res.data.blockchainTxId?.substring(0, 20) || 'recorded'}...` });
      fetchDashboardData();
    } catch (err) {
      const data = err.response?.data;
      if (data?.blocked) {
        setMessage({ type: 'blocked', text: data.message });
      } else {
        setMessage({ type: 'error', text: data?.message || 'Approval failed' });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id);
    try {
      await registrarApi.rejectTransfer({ transferId: rejectModal._id, rejectionReason: rejectReason });
      setMessage({ type: 'success', text: 'Transfer rejected.' });
      setRejectModal(null);
      setRejectReason('');
      fetchDashboardData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rejection failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = {
    PENDING:  'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    BLOCKED:  'bg-purple-100 text-purple-800',
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Transfer</h3>
            <p className="text-sm text-gray-500 mb-4">{rejectModal.transferId} — {rejectModal.sellerName} → {rejectModal.buyerName}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..." rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason || actionLoading}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Block Popup */}
      {message?.type === 'blocked' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔒</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700 mb-2">Transfer Blocked by Blockchain</h3>
                <p className="text-sm text-gray-700">{message.text}</p>
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-mono">Enforced by: Hyperledger Fabric Chaincode</p>
                  <p className="text-xs text-gray-500 font-mono">Channel: landchannel</p>
                  <p className="text-xs text-gray-500 font-mono">Chaincode: landregistry v3.0</p>
                </div>
              </div>
            </div>
            <button onClick={() => setMessage(null)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Close</button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sub-Registrar Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage land transfer requests and approvals</p>
      </div>

      {/* Message */}
      {message && message.type !== 'blocked' && (
        <div className={`mb-6 px-4 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex justify-between">
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Transfers', value: stats.pendingTransfers, color: 'yellow' },
          { label: 'Approved Today', value: stats.approvedToday, color: 'green' },
          { label: 'Rejected Today', value: stats.rejectedToday, color: 'red' },
          { label: 'Blocked (Fraud)', value: stats.blockedFraud, color: 'purple' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'pending', label: `⏳ Pending (${pendingTransfers.length})` },
            { id: 'history', label: `📋 History (${historyTransfers.length})` },
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

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Transfer Requests</h3>
            <p className="text-sm text-gray-500 mt-1">Approve to transfer ownership on Hyperledger Fabric blockchain</p>
          </div>
          <div className="p-6">
            {pendingTransfers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-sm">No pending transfer requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Transfer ID', 'Land', 'Seller', 'Buyer', 'Sale Price', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingTransfers.map(transfer => (
                      <tr key={transfer._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-xs font-mono text-gray-400">{transfer.transferId}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div>{transfer.landId}</div>
                          <div className="text-xs text-gray-400">{transfer.surveyNumber}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div>{transfer.sellerName}</div>
                          <div className="text-xs text-gray-400">{transfer.sellerAadhaar}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div>{transfer.buyerName}</div>
                          <div className="text-xs text-gray-400">{transfer.buyerAadhaar}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">₹{transfer.salePrice?.toLocaleString()}</td>
                        <td className="px-4 py-4 text-xs text-gray-400">{new Date(transfer.initiatedDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Link to={`/review-transfer/${transfer._id}`}
                              className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                              📋 Review
                            </Link>
                            <button onClick={() => handleApprove(transfer._id)}
                              disabled={actionLoading === transfer._id}
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50">
                              {actionLoading === transfer._id ? '⛓️...' : '✅ Approve'}
                            </button>
                            <button onClick={() => setRejectModal(transfer)}
                              disabled={actionLoading === transfer._id}
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

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Transfer History</h3>
          </div>
          <div className="p-6">
            {historyTransfers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-sm">No transfer history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Transfer ID', 'Land', 'Seller → Buyer', 'Sale Price', 'Status', 'Completed'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyTransfers.map(transfer => (
                      <tr key={transfer._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-400">{transfer.transferId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{transfer.landId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{transfer.sellerName} → {transfer.buyerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">₹{transfer.salePrice?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[transfer.status] || 'bg-gray-100 text-gray-800'}`}>
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{transfer.completedDate ? new Date(transfer.completedDate).toLocaleDateString('en-IN') : 'N/A'}</td>
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

export default SubRegistrarDashboard;