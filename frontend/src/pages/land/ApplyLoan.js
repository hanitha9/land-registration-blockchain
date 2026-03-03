import React, { useState, useEffect } from 'react';
import { landApi } from '../../services/landApi';
import { useNavigate } from 'react-router-dom';

const ApplyLoan = () => {
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    landId: '',
    bankId: '',
    requestedAmount: '',
    purpose: ''
  });

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const response = await landApi.getMyLands();
        // Show ALL lands — bank will verify eligibility on blockchain
        setLands(response.data.lands);
      } catch (err) {
        setError('Error fetching lands');
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await landApi.applyLoan(formData);
      setSuccess('Loan application submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting loan application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Apply for Loan</h3>
          <p className="mt-1 text-sm text-gray-500">Request a loan against your land property</p>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {lands.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No eligible lands</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any active lands that can be used for a loan.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="landId" className="block text-sm font-medium text-gray-700">
                  Select Land
                </label>
                <select
                  id="landId"
                  name="landId"
                  value={formData.landId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a land</option>
                  {lands.map((land) => (
                    <option key={land.landId} value={land.landId}>
                      {land.surveyNumber} - {land.location.village}, {land.location.district} ({land.areaSqFt} sq.ft)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="bankId" className="block text-sm font-medium text-gray-700">
                  Select Bank
                </label>
                <select
                  id="bankId"
                  name="bankId"
                  value={formData.bankId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a bank</option>
                  <option value="BANK_SBI">State Bank of India</option>
                  <option value="BANK_HDFC">HDFC Bank</option>
                  <option value="BANK_ICICI">ICICI Bank</option>
                  <option value="BANK_AXIS">Axis Bank</option>
                </select>
              </div>

              <div>
                <label htmlFor="requestedAmount" className="block text-sm font-medium text-gray-700">
                  Requested Amount (₹)
                </label>
                <input
                  type="number"
                  name="requestedAmount"
                  id="requestedAmount"
                  value={formData.requestedAmount}
                  onChange={handleChange}
                  required
                  min="100000"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                  Purpose of Loan
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={3}
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe the purpose of the loan..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyLoan;