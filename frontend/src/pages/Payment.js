import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaUniversity, FaCreditCard, FaMoneyBillWave, FaClock, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState(null); // 'now' or 'later'
  const [selectedBank, setSelectedBank] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);

  // Get data from navigation state
  const landRegistration = location.state?.landRegistration;
  const landRegistrationId = location.state?.landRegistrationId;

  // Bank details for payment
  const bankDetails = {
    accountName: 'Land Registry Authority',
    accountNumber: '1234567890123456',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    branch: 'Government Complex Branch',
    upiId: 'landregistry@sbi'
  };

  // List of banks for selection
  const banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'Indian Bank',
    'Central Bank of India',
    'Other'
  ];

  useEffect(() => {
    if (!landRegistration && !landRegistrationId) {
      navigate('/dashboard');
    }
  }, [landRegistration, landRegistrationId, navigate]);

  const handlePayNow = async () => {
    if (!selectedBank || !transactionId) {
      alert('Please select bank and enter transaction ID');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('paymentMethod', 'BANK_TRANSFER');
      formData.append('bankName', selectedBank);
      formData.append('transactionId', transactionId);
      if (paymentProof) {
        formData.append('paymentProof', paymentProof);
      }

      const response = await axios.post(
        `http://localhost:3000/api/land-registration/${landRegistrationId}/payment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('✅ Payment submitted successfully! Meeting will be scheduled soon.');
      navigate('/profile', { 
        state: { 
          showRegistrations: true,
          message: 'Payment completed! Check your registration status below.'
        }
      });

    } catch (error) {
      console.error('Payment Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePayLater = () => {
    alert('✅ Registration saved! You can pay later from your Profile page before the deadline.');
    navigate('/profile', {
      state: {
        showRegistrations: true,
        message: 'Registration saved! Complete payment before the deadline to proceed.'
      }
    });
  };

  if (!landRegistration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const payment = landRegistration.payment || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Land Registration Payment
            </h1>
            <p className="text-gray-600">
              Complete your payment to proceed with land registration
            </p>
          </div>

          {/* Registration Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-600" />
              Registration Summary
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="font-semibold">Survey Number:</p>
                <p>{landRegistration.surveyNumber}</p>
              </div>
              <div>
                <p className="font-semibold">Owner Name:</p>
                <p>{landRegistration.claimedOwnerName}</p>
              </div>
              <div>
                <p className="font-semibold">Location:</p>
                <p>
                  {landRegistration.address?.village}, {landRegistration.address?.district}, {landRegistration.address?.state}
                </p>
              </div>
              <div>
                <p className="font-semibold">Land Area:</p>
                <p>{landRegistration.measurements?.squareFeet} sq.ft</p>
              </div>
              <div>
                <p className="font-semibold">Registration Type:</p>
                <p>{landRegistration.registrationType?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Pending Payment
                </span>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Land ID will be generated after verification and approval by the registrar.
                Meeting will be scheduled after payment confirmation.
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-600" />
              Payment Details
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Base Amount:</span>
                <span className="font-semibold">₹ {payment.baseAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-semibold">₹ {payment.gstAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between py-2 text-lg">
                <span className="font-bold text-gray-800">Total Amount:</span>
                <span className="font-bold text-green-600">₹ {payment.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Bank Account Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-green-800 mb-3 flex items-center">
                <FaUniversity className="mr-2" />
                Transfer Payment To:
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Account Name:</p>
                  <p className="font-semibold">{bankDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Number:</p>
                  <p className="font-semibold font-mono">{bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">IFSC Code:</p>
                  <p className="font-semibold font-mono">{bankDetails.ifscCode}</p>
                </div>
                <div>
                  <p className="text-gray-600">Bank:</p>
                  <p className="font-semibold">{bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Branch:</p>
                  <p className="font-semibold">{bankDetails.branch}</p>
                </div>
                <div>
                  <p className="text-gray-600">UPI ID:</p>
                  <p className="font-semibold font-mono">{bankDetails.upiId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          {!paymentChoice && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Choose Payment Option
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentChoice('now')}
                  className="p-6 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <FaCreditCard className="text-4xl text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-green-700">Pay Now</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Complete payment now and get faster processing
                  </p>
                </button>

                <button
                  onClick={() => setPaymentChoice('later')}
                  className="p-6 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <FaClock className="text-4xl text-orange-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-orange-700">Pay Later</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Pay from your profile within 7 days
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Pay Now Form */}
          {paymentChoice === 'now' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-green-600" />
                Complete Payment
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Your Bank *
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">-- Select Bank --</option>
                    {banks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Transaction ID / UTR Number *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction reference number"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload Payment Proof (Screenshot/Receipt)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentProof(e.target.files[0])}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  {paymentProof && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {paymentProof.name} selected
                    </p>
                  )}
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setPaymentChoice(null)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayNow}
                    disabled={loading || !selectedBank || !transactionId}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pay Later Confirmation */}
          {paymentChoice === 'later' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-2 text-orange-600" />
                Pay Later - Important Information
              </h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <ul className="list-disc list-inside text-yellow-800 space-y-2">
                  <li>You must complete payment within <strong>7 days</strong></li>
                  <li>Meeting will only be scheduled after payment confirmation</li>
                  <li>You can pay anytime from your <strong>Profile</strong> page</li>
                  <li>Registration will be cancelled if payment is not received within deadline</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-800">Payment Deadline:</p>
                <p className="text-lg text-red-600">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setPaymentChoice(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handlePayLater}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg"
                >
                  Confirm - I'll Pay Later
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Payment;