import React, { useState, useEffect } from 'react';
import { landApi } from '../../services/landApi';
import { Link, useNavigate } from 'react-router-dom';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [stats, setStats] = useState({ totalLands: 0, activeLands: 0, mortgagedLands: 0, pendingSales: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [blockError, setBlockError] = useState(null); // fraud block popup

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await landApi.getMyLands();
      const landsData = response.data.lands;
      setLands(landsData);
      setStats({
        totalLands: landsData.length,
        activeLands: landsData.filter(l => l.currentStatus === 'ACTIVE').length,
        mortgagedLands: landsData.filter(l => l.isMortgaged).length,
        pendingSales: landsData.filter(l => l.currentStatus === 'PENDING_TRANSFER').length,
        totalValue: landsData.reduce((sum, l) => sum + (l.marketValue || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show fraud block message instead of navigating
  const handleBlockedAction = (land, action) => {
    let reason = '';
    if (land.currentStatus === 'LOCKED' || land.isMortgaged) {
      reason = `🚫 FRAUD BLOCKED by Blockchain\n\nCannot ${action} land "${land.surveyNumber}".\n\nReason: This land has an active mortgage with ${land.encumbranceDetails?.bankName || 'a bank'}.\nLoan Amount: ₹${land.encumbranceDetails?.loanAmount?.toLocaleString() || 'N/A'}\n\nThe Hyperledger Fabric chaincode has blocked this transaction to prevent fraud. Clear the loan first.`;
    } else if (land.currentStatus === 'DISPUTED') {
      reason = `🚫 BLOCKED by Blockchain\n\nCannot ${action} land "${land.surveyNumber}".\n\nReason: This land has an active legal dispute. All transactions are frozen until the dispute is resolved.`;
    } else if (land.currentStatus === 'PENDING_TRANSFER') {
      reason = `⏳ Transaction Pending\n\nCannot ${action} land "${land.surveyNumber}".\n\nReason: A sale is already in progress for this land.`;
    } else if (land.currentStatus === 'PENDING_VERIFICATION') {
      reason = `⏳ Pending Verification\n\nCannot ${action} land "${land.surveyNumber}".\n\nReason: This land is awaiting revenue officer verification.`;
    }
    setBlockError(reason);
  };

  const canDoAction = (land) => land.currentStatus === 'ACTIVE' && !land.isMortgaged;

  const statusConfig = {
    ACTIVE:               { color: 'bg-green-100 text-green-800',  label: 'Active' },
    LOCKED:               { color: 'bg-yellow-100 text-yellow-800', label: '🔒 Locked' },
    DISPUTED:             { color: 'bg-red-100 text-red-800',       label: '⚠️ Disputed' },
    PENDING_TRANSFER:     { color: 'bg-blue-100 text-blue-800',     label: 'Pending Sale' },
    PENDING_VERIFICATION: { color: 'bg-orange-100 text-orange-800', label: '⏳ Pending Verification' },
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Blockchain Fraud Block Popup */}
      {blockError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔒</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700 mb-2">Blockchain Transaction Blocked</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{blockError}</pre>
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-mono">Enforced by: Hyperledger Fabric Chaincode</p>
                  <p className="text-xs text-gray-500 font-mono">Channel: landchannel</p>
                  <p className="text-xs text-gray-500 font-mono">Chaincode: landregistry v3.0</p>
                </div>
              </div>
            </div>
            <button onClick={() => setBlockError(null)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Land Registry</h1>
        <p className="mt-2 text-gray-600">Manage your land properties and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Lands', value: stats.totalLands, color: 'blue' },
          { label: 'Active', value: stats.activeLands, color: 'green' },
          { label: 'Mortgaged', value: stats.mortgagedLands, color: 'yellow' },
          { label: 'Pending Sales', value: stats.pendingSales, color: 'purple' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 10000000).toFixed(2)} Cr`, color: 'indigo' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-4">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/request-land-registration"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          + Register New Land
        </Link>
        <Link to="/apply-loan"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
          Apply for Loan
        </Link>
        <Link to="/initiate-sale"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
          Initiate Sale
        </Link>
      </div>

      {/* My Properties */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Properties</h3>
          <p className="text-sm text-gray-500 mt-1">Click Sell or Loan on any land — blockchain will enforce fraud prevention</p>
        </div>
        <div className="p-6">
          {lands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No properties found.</p>
              <Link to="/request-land-registration" className="mt-4 inline-block text-indigo-600 hover:underline">Register your first land →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lands.map((land) => {
                const status = statusConfig[land.currentStatus] || { color: 'bg-gray-100 text-gray-800', label: land.currentStatus };
                const allowed = canDoAction(land);
                return (
                  <div key={land.landId} className={`border rounded-lg overflow-hidden shadow-sm ${
                    land.isMortgaged ? 'border-yellow-300' :
                    land.currentStatus === 'DISPUTED' ? 'border-red-300' :
                    land.currentStatus === 'PENDING_VERIFICATION' ? 'border-orange-300' :
                    'border-gray-200'
                  }`}>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{land.surveyNumber}</h3>
                          <p className="text-xs text-gray-500">{land.location?.village}, {land.location?.district}</p>
                          <p className="text-xs text-gray-400">{land.landId}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Area</span>
                          <span className="font-medium">{land.areaSqFt} sq.ft</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Value</span>
                          <span className="font-medium">₹{land.marketValue?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className="font-medium">{land.landType}</span>
                        </div>
                      </div>

                      {/* Encumbrance warning */}
                      {land.isMortgaged && (
                        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                          <p className="text-xs text-yellow-800 font-medium">🔒 Mortgaged with {land.encumbranceDetails?.bankName}</p>
                          <p className="text-xs text-yellow-600">₹{land.encumbranceDetails?.loanAmount?.toLocaleString()}</p>
                        </div>
                      )}

                      {land.currentStatus === 'DISPUTED' && (
                        <div className="mb-3 bg-red-50 border border-red-200 rounded p-2">
                          <p className="text-xs text-red-800 font-medium">⚠️ Land has active dispute</p>
                        </div>
                      )}

                      {land.currentStatus === 'PENDING_VERIFICATION' && (
                        <div className="mb-3 bg-orange-50 border border-orange-200 rounded p-2">
                          <p className="text-xs text-orange-800 font-medium">⏳ Awaiting revenue officer approval</p>
                        </div>
                      )}

                      {/* Action buttons — ALL lands can initiate sale/loan */}
                      <div className="grid grid-cols-3 gap-2">
                        <Link to={`/land/${land.landId}`}
                          className="text-center py-1.5 px-2 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          View
                        </Link>
                        <Link to={`/initiate-sale?landId=${land.landId}`}
                          className="text-center py-1.5 px-2 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700">
                          Sell
                        </Link>
                        <Link to={`/apply-loan?landId=${land.landId}`}
                          className="text-center py-1.5 px-2 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700">
                          Loan
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;