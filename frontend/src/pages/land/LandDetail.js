import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { landApi } from '../../services/landApi';
import { revenueApi } from '../../services/revenueApi';
import { useAuth } from '../../context/AuthContext';

const LandDetail = () => {
  const { landId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [land, setLand] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    fetchLandDetails();
  }, [landId]);

  const fetchLandDetails = async () => {
    try {
      setLoading(true);
      const response = await landApi.getLandById(landId);
      setLand(response.data.land);
      if (response.data.blockchainData) setBlockchainData(response.data.blockchainData);
      if (response.data.history) setHistory(response.data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load land details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await revenueApi.approveLandRegistration({ landId });
      setMessage({ type: 'success', text: `✅ Land approved and registered on blockchain! TxID: ${res.data.blockchainTxId?.substring(0, 20)}...` });
      fetchLandDetails();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await revenueApi.rejectLandRegistration({ landId, reason: rejectReason });
      setMessage({ type: 'success', text: `Land registration rejected.` });
      setRejectModal(false);
      setRejectReason('');
      fetchLandDetails();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDisputed = async () => {
    setActionLoading(true);
    try {
      await revenueApi.markLandDisputed({ landId, reason: disputeReason });
      setMessage({ type: 'success', text: `Land marked as disputed.` });
      setDisputeModal(false);
      setDisputeReason('');
      fetchLandDetails();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    setActionLoading(true);
    try {
      await revenueApi.resolveLandDispute({ landId, resolution: disputeReason });
      setMessage({ type: 'success', text: `Dispute resolved.` });
      setDisputeModal(false);
      setDisputeReason('');
      fetchLandDetails();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline">← Go Back</button>
    </div>
  );

  if (!land) return null;

  const statusColor = {
    ACTIVE: 'bg-green-100 text-green-800',
    LOCKED: 'bg-yellow-100 text-yellow-800',
    DISPUTED: 'bg-red-100 text-red-800',
    PENDING_TRANSFER: 'bg-blue-100 text-blue-800',
    PENDING_VERIFICATION: 'bg-orange-100 text-orange-800',
  }[land.currentStatus] || 'bg-gray-100 text-gray-800';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Registration</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..." rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {land?.currentStatus === 'DISPUTED' ? 'Resolve Dispute' : 'Mark as Disputed'}
            </h3>
            <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
              placeholder={land?.currentStatus === 'DISPUTED' ? 'Enter resolution details...' : 'Enter dispute reason...'}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDisputeModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={land?.currentStatus === 'DISPUTED' ? handleResolveDispute : handleMarkDisputed}
                disabled={actionLoading}
                className={`flex-1 py-2 px-4 text-white rounded-lg text-sm font-medium disabled:opacity-50 ${land?.currentStatus === 'DISPUTED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {actionLoading ? 'Processing...' : land?.currentStatus === 'DISPUTED' ? 'Resolve' : 'Mark Disputed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {land?.currentStatus?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Message */}
      {message && message.type !== 'blocked' && (
        <div className={`mb-4 px-4 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex justify-between">
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Blockchain Fraud Block Popup */}
      {message && message.type === 'blocked' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{message.reason === 'MORTGAGE' ? '🔒' : '⚠️'}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700 mb-2">Registration Blocked</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.text}</p>
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-mono">Enforced by: Revenue Officer Fraud Check</p>
                  <p className="text-xs text-gray-500 font-mono">Channel: landchannel</p>
                  <p className="text-xs text-gray-500 font-mono">Chaincode: landregistry v3.0</p>
                </div>
              </div>
            </div>
            <button onClick={() => setMessage(null)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Revenue Officer Action Bar */}
      {user?.role === 'revenue_officer' && land && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-800 mb-3">🏛️ Revenue Officer Actions</p>
          <div className="flex flex-wrap gap-3">
            {(land.currentStatus === 'PENDING_VERIFICATION' || land.currentStatus === 'LOCKED' || land.currentStatus === 'ACTIVE' || land.currentStatus === 'PENDING_TRANSFER') && (
              <>
                <button onClick={handleApprove} disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  {actionLoading ? '⛓️ Processing...' : '✅ Approve & Register on Blockchain'}
                </button>
                <button onClick={() => setRejectModal(true)} disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                  ❌ Reject Registration
                </button>
              </>
            )}
            {land.currentStatus === 'DISPUTED' && (
              <button onClick={() => setDisputeModal(true)} disabled={actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                ✅ Resolve Dispute
              </button>
            )}
            {['ACTIVE', 'LOCKED', 'PENDING_TRANSFER'].includes(land.currentStatus) && (
              <button onClick={() => setDisputeModal(true)} disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                🚩 Mark as Disputed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{land.surveyNumber}</h1>
            <p className="text-gray-500 mt-1">{land.location?.village}, {land.location?.district}, {land.location?.state} — {land.location?.pincode}</p>
            <p className="text-xs text-gray-400 mt-1">Land ID: {land.landId}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">₹{land.marketValue?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Market Value</p>
          </div>
        </div>

        {/* Key stats row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Area', value: `${land.areaSqFt} sq.ft` },
            { label: 'Land Type', value: land.landType },
            { label: 'Owner', value: land.ownerName },
            { label: 'Mortgaged', value: land.isMortgaged ? '🔒 Yes' : '✅ No' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['details', 'blockchain', 'documents', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'blockchain' ? '⛓️ Blockchain' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Details */}
      {activeTab === 'details' && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Land Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Survey Number', value: land.surveyNumber },
                { label: 'Land ID', value: land.landId },
                { label: 'Land Type', value: land.landType },
                { label: 'Area', value: `${land.areaSqFt} sq.ft` },
                { label: 'Market Value', value: `₹${land.marketValue?.toLocaleString()}` },
                { label: 'Status', value: land.currentStatus },
                { label: 'Village', value: land.location?.village },
                { label: 'District', value: land.location?.district },
                { label: 'State', value: land.location?.state },
                { label: 'Pincode', value: land.location?.pincode },
                { label: 'Owner', value: land.ownerName },
                { label: 'Registered On', value: land.createdAt ? new Date(land.createdAt).toLocaleDateString('en-IN') : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="border-b border-gray-100 pb-3">
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-0.5">{value || 'N/A'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Encumbrance */}
          {land.isMortgaged && land.encumbranceDetails && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-3">🔒 Encumbrance Details</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Bank', value: land.encumbranceDetails.bankName },
                  { label: 'Loan Amount', value: `₹${land.encumbranceDetails.loanAmount?.toLocaleString()}` },
                  { label: 'Loan Status', value: land.encumbranceDetails.loanStatus },
                  { label: 'Mortgage Date', value: land.encumbranceDetails.mortgageDate ? new Date(land.encumbranceDetails.mortgageDate).toLocaleDateString('en-IN') : 'N/A' },
                  { label: 'Blockchain TxID', value: land.encumbranceDetails.blockchainTxId ? land.encumbranceDetails.blockchainTxId.substring(0, 20) + '...' : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-yellow-700">{label}</dt>
                    <dd className="text-sm font-medium text-yellow-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      {/* Tab: Blockchain */}
      {activeTab === 'blockchain' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⛓️ Blockchain Record</h3>
          {blockchainData ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800">✅ Verified on Hyperledger Fabric</p>
                <p className="text-xs text-green-600 mt-1">This land record is immutably stored on the blockchain</p>
              </div>
              <dl className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Land ID on Chain', value: blockchainData.landId },
                  { label: 'Owner on Chain', value: blockchainData.ownerName },
                  { label: 'Status on Chain', value: blockchainData.currentStatus },
                  { label: 'Mortgaged on Chain', value: blockchainData.isMortgaged ? '🔒 Yes' : '✅ No' },
                  { label: 'Market Value on Chain', value: `₹${Number(blockchainData.marketValue).toLocaleString()}` },
                  { label: 'Registration Date', value: blockchainData.registrationDate ? new Date(blockchainData.registrationDate).toLocaleString('en-IN') : 'N/A' },
                  { label: 'Last Updated', value: blockchainData.lastUpdated ? new Date(blockchainData.lastUpdated).toLocaleString('en-IN') : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="border-b border-gray-100 pb-3">
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-0.5 font-mono">{value}</dd>
                  </div>
                ))}
              </dl>

              {blockchainData.encumbranceDetails?.blockchainTxId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Mortgage TxID</p>
                  <p className="text-xs font-mono text-gray-700 break-all mt-1">{blockchainData.encumbranceDetails.blockchainTxId}</p>
                </div>
              )}

              {blockchainData.previousOwners?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Previous Owners (on blockchain)</h4>
                  {blockchainData.previousOwners.map((owner, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 mb-2 text-sm">
                      <p className="font-medium">{owner.ownerName}</p>
                      <p className="text-gray-500 text-xs">Transferred: {new Date(owner.transferDate).toLocaleDateString('en-IN')} — ₹{Number(owner.salePrice).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">⛓️</p>
              <p className="text-sm">Blockchain data not available for this land</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documents & Photos</h3>

          {/* Land Documents (array format from DB) */}
          {land.documents && land.documents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">📄 Land Documents</h4>
              <div className="space-y-3">
                {land.documents.map((doc, idx) => {
                  const filename = doc.docPath ? doc.docPath.split('/').pop() : null;
                  const folder = doc.docType === 'land_document' ? 'land-docs' : 'land-docs';
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.docType?.replace('_', ' ').toUpperCase() || `Document ${idx + 1}`}</p>
                          <p className="text-xs text-gray-500">{filename || 'No filename'}</p>
                          {doc.description && <p className="text-xs text-gray-400">{doc.description}</p>}
                        </div>
                      </div>
                      {filename && (
                        <a href={`http://localhost:3000/uploads/${folder}/${filename}`}
                          target="_blank" rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 border border-indigo-200 rounded">
                          View
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Land Photos */}
          {land.landPhotos && land.landPhotos.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">🖼️ Land Photos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {land.landPhotos.map((photo, idx) => {
                  const filename = photo.split('/').pop();
                  const url = `http://localhost:3000/uploads/land-photos/${filename}`;
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Land photo ${idx + 1}`}
                        className="w-full h-32 object-cover"
                        onError={e => { e.target.style.display='none'; }}
                      />
                      <div className="p-2 flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate">Photo {idx + 1}</p>
                        <a href={url} target="_blank" rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline">View</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No documents */}
          {(!land.documents || land.documents.length === 0) && (!land.landPhotos || land.landPhotos.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📁</p>
              <p className="text-sm font-medium">No documents uploaded</p>
              <p className="text-xs mt-1">Documents uploaded during land registration will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h3>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((record, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-mono text-gray-400">{record.txId?.substring(0, 24)}...</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        Status: {record.data?.currentStatus || 'N/A'}
                        {record.data?.isMortgaged ? ' 🔒' : ' ✅'}
                      </p>
                      {record.data?.ownerName && (
                        <p className="text-xs text-gray-500">Owner: {record.data.ownerName}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{new Date(record.timestamp).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm">No blockchain history available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandDetail;