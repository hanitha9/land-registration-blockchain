import React, { useState, useEffect } from 'react';
import { landApi } from '../../services/landApi';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const InitiateSale = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null); // found buyer from DB
  const [buyerNotFound, setBuyerNotFound] = useState(false);
  const [formData, setFormData] = useState({
    landId: new URLSearchParams(location.search).get('landId') || '',
    buyerAadhaar: '',
    buyerName: '',
    salePrice: ''
  });

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const response = await landApi.getMyLands();
        // Show ALL lands — sub-registrar will verify eligibility
        setLands(response.data.lands);
        const urlLandId = new URLSearchParams(location.search).get('landId');
        if (urlLandId) {
          setFormData(prev => ({ ...prev, landId: urlLandId }));
        }
      } catch (err) {
        setError('Error fetching lands');
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset buyer info when aadhaar changes
    if (name === 'buyerAadhaar') {
      setBuyerInfo(null);
      setBuyerNotFound(false);
    }
  };

  // Lookup buyer by Aadhaar
  const handleLookupBuyer = async () => {
    if (!formData.buyerAadhaar || formData.buyerAadhaar.length !== 12) {
      setError('Enter a valid 12-digit Aadhaar number');
      return;
    }
    setLookingUp(true);
    setBuyerInfo(null);
    setBuyerNotFound(false);
    setError('');
    try {
      const res = await api.get(`/auth/lookup-citizen?aadhaar=${formData.buyerAadhaar}`);
      if (res.data.found) {
        setBuyerInfo(res.data.user);
        setFormData(prev => ({ ...prev, buyerName: res.data.user.fullName }));
      } else {
        setBuyerNotFound(true);
        // Keep the name field editable for new buyer
      }
    } catch (err) {
      setBuyerNotFound(true);
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await landApi.initiateSale({
        ...formData,
        buyerExists: !!buyerInfo,
        buyerId: buyerInfo?._id || null,
      });
      
      let successMsg = '✅ Sale initiated successfully! Sent to Sub-Registrar for verification.';
      if (response.data.newAccountCreated) {
        successMsg += `\n\n🆕 New citizen account created for buyer:\nAadhaar: ${formData.buyerAadhaar}\nPassword: Welcome@1234\n(Buyer can change password after first login)`;
      }
      setSuccess(successMsg);
      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error initiating sale');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLand = lands.find(l => l.landId === formData.landId);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Initiate Land Sale</h3>
          <p className="mt-1 text-sm text-gray-500">Start the process to sell your land — Sub-Registrar will verify eligibility</p>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded whitespace-pre-wrap text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded whitespace-pre-wrap text-sm">{success}</div>
          )}

          {lands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No lands found.</p>
              <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Back</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Land Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Land to Sell</label>
                <select name="landId" value={formData.landId} onChange={handleChange} required
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">Select a land</option>
                  {lands.map(land => (
                    <option key={land.landId} value={land.landId}>
                      {land.surveyNumber} — {land.location?.village}, {land.location?.district} ({land.areaSqFt} sq.ft)
                      {land.isMortgaged ? ' 🔒 MORTGAGED' : ''}
                      {land.currentStatus !== 'ACTIVE' ? ` [${land.currentStatus}]` : ''}
                    </option>
                  ))}
                </select>

                {/* Warning if selected land is mortgaged */}
                {selectedLand?.isMortgaged && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-xs text-yellow-800 font-medium">⚠️ This land has an active mortgage</p>
                    <p className="text-xs text-yellow-600">The Sub-Registrar will verify blockchain status. Sale may be blocked by chaincode if mortgage is active.</p>
                  </div>
                )}
                {selectedLand && !selectedLand.isMortgaged && selectedLand.currentStatus === 'ACTIVE' && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-xs text-green-800 font-medium">✅ Land is eligible for sale</p>
                  </div>
                )}
              </div>

              {/* Buyer Information */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Buyer Information</h4>

                {/* Aadhaar lookup */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Aadhaar Number</label>
                  <div className="flex gap-2">
                    <input type="text" name="buyerAadhaar" value={formData.buyerAadhaar}
                      onChange={handleChange} maxLength="12" pattern="[0-9]{12}"
                      placeholder="12-digit Aadhaar"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <button type="button" onClick={handleLookupBuyer} disabled={lookingUp || formData.buyerAadhaar.length !== 12}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md disabled:opacity-50">
                      {lookingUp ? '🔍...' : '🔍 Lookup'}
                    </button>
                  </div>

                  {/* Buyer found */}
                  {buyerInfo && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-800">✅ Registered Citizen Found</p>
                      <p className="text-xs text-green-700 mt-1">Name: {buyerInfo.fullName}</p>
                      <p className="text-xs text-green-700">Aadhaar: {buyerInfo.aadhaarNumber}</p>
                    </div>
                  )}

                  {/* Buyer not found — will auto-create */}
                  {buyerNotFound && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-800">🆕 Buyer not found — New account will be created</p>
                      <p className="text-xs text-blue-700 mt-1">A citizen account will be auto-created after sale approval.</p>
                      <p className="text-xs text-blue-700">Default credentials: Aadhaar / <strong>Welcome@1234</strong></p>
                    </div>
                  )}
                </div>

                {/* Buyer Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Full Name</label>
                  <input type="text" name="buyerName" value={formData.buyerName}
                    onChange={handleChange} required
                    readOnly={!!buyerInfo}
                    className={`block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${buyerInfo ? 'bg-gray-50' : ''}`} />
                </div>

                {/* Sale Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (₹)</label>
                  <input type="number" name="salePrice" value={formData.salePrice}
                    onChange={handleChange} required min="100000"
                    placeholder="e.g. 5000000"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>

              {/* Info box */}
              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4">
                <p className="text-sm text-indigo-700">
                  <strong>How this works:</strong> Your sale request will be sent to the Sub-Registrar for verification.
                  The Sub-Registrar checks the blockchain ledger to verify the land is free of encumbrances.
                  If the land has an active mortgage, the blockchain chaincode will block the transfer automatically.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || (!buyerInfo && !buyerNotFound)}
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Initiate Sale →'}
                </button>
              </div>

              {!buyerInfo && !buyerNotFound && formData.buyerAadhaar.length === 12 && (
                <p className="text-xs text-center text-gray-400">Click "Lookup" to verify buyer before submitting</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitiateSale;