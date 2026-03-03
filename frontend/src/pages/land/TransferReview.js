import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrarApi } from '../../services/registrarApi';
import { landApi } from '../../services/landApi';

const TransferReview = () => {
  const { transferId } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [land, setLand] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchTransferDetails();
  }, [transferId]);

  const fetchTransferDetails = async () => {
    try {
      setLoading(true);
      const verifyRes = await registrarApi.verifyTransfer(transferId);
      setTransfer(verifyRes.data.transferRequest);
      setVerification(verifyRes.data.verification);

      // Fetch land details with blockchain
      if (verifyRes.data.transferRequest?.landId) {
        try {
          const landRes = await landApi.getLandById(verifyRes.data.transferRequest.landId);
          setLand(landRes.data.land);
          setBlockchainData(landRes.data.blockchainData);
        } catch (e) {
          console.warn('Land fetch failed:', e.message);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load transfer details' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await registrarApi.approveTransfer({ transferId });
      setMessage({ type: 'success', text: `✅ Transfer approved! Ownership transferred on blockchain. TxID: ${res.data.blockchainTxId?.substring(0, 20) || 'recorded'}...` });
      setTimeout(() => navigate('/registrar-dashboard'), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.blocked) {
        setMessage({ type: 'blocked', text: data.message, reason: data.reason });
      } else {
        setMessage({ type: 'error', text: data?.message || 'Approval failed' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await registrarApi.rejectTransfer({ transferId, rejectionReason: rejectReason });
      setMessage({ type: 'success', text: 'Transfer rejected successfully.' });
      setTimeout(() => navigate('/registrar-dashboard'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
      setRejectModal(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const isBlocked = transfer?.status === 'BLOCKED' || verification?.isMortgaged || verification?.hasDispute;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Transfer</h3>
            <p className="text-sm text-gray-500 mb-4">Transfer ID: {transfer?.transferId}</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..." rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(false)}
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
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.text}</p>
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

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/registrar-dashboard')} className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        {transfer && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            transfer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            transfer.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            transfer.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>{transfer.status}</span>
        )}
      </div>

      {/* Messages */}
      {message && message.type !== 'blocked' && (
        <div className={`mb-4 px-4 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex justify-between">
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Fraud Warning */}
      {isBlocked && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <h3 className="text-sm font-bold text-red-800">Blockchain Fraud Alert</h3>
              <p className="text-sm text-red-700 mt-1">
                {verification?.isMortgaged && `This land has an active mortgage — transfer is blocked by chaincode.`}
                {verification?.hasDispute && `This land has an active legal dispute — transfer is blocked.`}
                {transfer?.blockReason && ` Reason: ${transfer.blockReason}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details */}
      {transfer && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Transfer Request Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Transfer ID', value: transfer.transferId },
              { label: 'Land ID', value: transfer.landId },
              { label: 'Survey Number', value: transfer.surveyNumber || land?.surveyNumber },
              { label: 'Sale Price', value: `₹${transfer.salePrice?.toLocaleString()}` },
              { label: 'Seller', value: transfer.sellerName },
              { label: 'Seller Aadhaar', value: transfer.sellerAadhaar },
              { label: 'Buyer', value: transfer.buyerName },
              { label: 'Buyer Aadhaar', value: transfer.buyerAadhaar },
              { label: 'Initiated Date', value: transfer.initiatedDate ? new Date(transfer.initiatedDate).toLocaleDateString('en-IN') : 'N/A' },
              { label: 'Status', value: transfer.status },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{value || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Land Details */}
      {land && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Land Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Survey Number', value: land.surveyNumber },
              { label: 'Land Type', value: land.landType },
              { label: 'Area', value: `${land.areaSqFt} sq.ft` },
              { label: 'Market Value', value: `₹${land.marketValue?.toLocaleString()}` },
              { label: 'District', value: land.location?.district },
              { label: 'State', value: land.location?.state },
              { label: 'Current Status', value: land.currentStatus },
              { label: 'Mortgaged', value: land.isMortgaged ? '🔒 Yes' : '✅ No' },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{value || 'N/A'}</p>
              </div>
            ))}
          </div>

          {land.isMortgaged && land.encumbranceDetails?.bankName && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-yellow-800">🔒 Active Mortgage</p>
              <p className="text-xs text-yellow-700">Bank: {land.encumbranceDetails.bankName} | Loan: ₹{land.encumbranceDetails.loanAmount?.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Blockchain Verification */}
      {blockchainData && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⛓️ Blockchain Verification</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-green-800">✅ Land verified on Hyperledger Fabric</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Owner on Chain', value: blockchainData.ownerName },
              { label: 'Status on Chain', value: blockchainData.currentStatus },
              { label: 'Mortgaged on Chain', value: blockchainData.isMortgaged ? '🔒 Yes' : '✅ No' },
              { label: 'Last Updated', value: blockchainData.lastUpdated ? new Date(blockchainData.lastUpdated).toLocaleString('en-IN') : 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900 font-mono mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {transfer?.status === 'PENDING' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-800 mb-3">🏛️ Sub-Registrar Actions</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleApprove} disabled={actionLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {actionLoading ? '⛓️ Processing...' : '✅ Approve Transfer & Register on Blockchain'}
            </button>
            <button onClick={() => setRejectModal(true)} disabled={actionLoading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              ❌ Reject Transfer
            </button>
          </div>
          {isBlocked && (
            <p className="text-xs text-red-600 mt-2">⚠️ Warning: This transfer has fraud indicators. Approving will be blocked by blockchain chaincode.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TransferReview;