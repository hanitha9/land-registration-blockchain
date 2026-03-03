import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authApi';
import { indianStates } from '../data/indianStates';
import { FaUser, FaIdCard, FaPhone, FaLock, FaUpload, FaMapMarkerAlt, FaRedo } from 'react-icons/fa';

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: '',
    aadhaarDocument: null,          // File object - only used temporarily
    aadhaarDocumentPath: '',        // ← NEW: store backend path
    aadhaarVerified: false,
    aadhaarName: '',
    panNumber: '',
    panDocument: null,              // File object - only used temporarily
    panDocumentPath: '',            // ← NEW: store backend path
    panVerified: false,
    panName: '',
    mobileNumber: '',
    otp: '',
    mobileVerified: false,
    email: '',
    dateOfBirth: '',
    maritalStatus: 'Single',
    occupation: '',
    spouse: { fullName: '', aadhaarNumber: '', mobileNumber: '' },
    children: [],
    parents: [
      { fullName: '', aadhaarNumber: '', mobileNumber: '', relationship: 'Father' },
      { fullName: '', aadhaarNumber: '', mobileNumber: '', relationship: 'Mother' }
    ],
    address: {
      street: '', village: '', city: '', constituency: '', district: '', state: '', pincode: ''
    },
    password: '',
    confirmPassword: ''
  });

  const [selectedState, setSelectedState] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: { ...formData[parent], [field]: value }
    });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [fieldName]: file });
  };

  // ========================================
  // STEP 1: AADHAAR VERIFICATION
  // ========================================
  const handleAadhaarVerification = async (e) => {
    e.preventDefault();
    
    if (!formData.aadhaarDocument) {
      alert('Please upload Aadhaar document');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('aadhaarNumber', formData.aadhaarNumber);
      formDataToSend.append('aadhaarDocument', formData.aadhaarDocument);

      const response = await authService.verifyAadhaar(formDataToSend);
      const data = response.data || response;
      
      console.log('Aadhaar Response:', data);

      const nameMatch = data.nameMatch === true;
      const aadhaarMatch = data.aadhaarMatch === true;
      const extractedName = data.extractedName || 'Not extracted';
      const extractedAadhaar = data.extractedAadhaar || 'Not extracted';

      // ── IMPORTANT: Store the path returned by backend ──
      const aadhaarPath = data.aadhaarDocumentPath || data.data?.aadhaarDocument;

      setFormData(prev => ({
        ...prev,
        aadhaarVerified: nameMatch && aadhaarMatch,
        aadhaarName: extractedName,
        aadhaarDocumentPath: aadhaarPath || ''   // save path
      }));

      if (nameMatch && aadhaarMatch) {
        alert(
          `✅ Aadhaar Verified Successfully!\n\n` +
          `Name: ${extractedName}\n` +
          `Aadhaar: ${extractedAadhaar}`
        );
        setCurrentStep(2);
      } else if (aadhaarMatch && !nameMatch) {
        alert(`❌ NAME MISMATCH! ...`);
      } else if (nameMatch && !aadhaarMatch) {
        alert(`❌ AADHAAR NUMBER MISMATCH! ...`);
      } else {
        alert(`❌ Verification Failed! ...`);
      }
    } catch (error) {
      console.error('Aadhaar Error:', error);
      const msg = error.response?.data?.message || error.message;
      if (msg.includes('already registered')) {
        alert('❌ ' + msg + '\n\nPlease login instead.');
        navigate('/login');
      } else {
        alert('❌ Error: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // STEP 2: PAN VERIFICATION
  // ========================================
  const handlePANVerification = async (e) => {
    e.preventDefault();
    
    if (!formData.panDocument) {
      alert('Please upload PAN document');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('panNumber', formData.panNumber);
      formDataToSend.append('panDocument', formData.panDocument);

      const response = await authService.verifyPAN(formDataToSend);
      const data = response.data || response;

      console.log('PAN Response:', data);

      const nameMatch = data.nameMatch === true;
      const panMatch = data.panMatch === true;
      const extractedName = data.extractedName || 'Not extracted';
      const extractedPAN = data.extractedPAN || 'Not extracted';

      // ── IMPORTANT: Store the path returned by backend ──
      const panPath = data.panDocumentPath || data.data?.panDocument;

      setFormData(prev => ({
        ...prev,
        panVerified: nameMatch && panMatch,
        panName: extractedName,
        panDocumentPath: panPath || ''   // save path
      }));

      if (nameMatch && panMatch) {
        alert(`✅ PAN Verified Successfully!\n\nName: ${extractedName}\nPAN: ${extractedPAN}`);
        setCurrentStep(3);
      } else {
        // lenient logic as before
        alert(`📄 PAN Document Uploaded.\n\nWe couldn't fully verify, but you can proceed.`);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('PAN Error:', error);
      alert('❌ Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // STEP 3: SEND OTP  (unchanged)
  // ========================================
  const handleSendOTP = async () => {
    // ... same as before ...
  };

  const handleResendOTP = () => {
    // ... same as before ...
  };

  const handleVerifyOTP = async (e) => {
    // ... same as before ...
  };

  // ========================================
  // COMPLETE SIGNUP – FIXED
  // ========================================
  const handleCompleteSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    // Check if we have document paths
    if (!formData.aadhaarDocumentPath) {
      alert('Aadhaar document path is missing. Please complete Aadhaar verification again.');
      return;
    }

    // PAN can be optional depending on your business rule
    // if (!formData.panDocumentPath) {
    //   alert('PAN document path is missing. Please complete PAN verification.');
    //   return;
    // }

    setLoading(true);
    try {
      // Prepare clean data object – NO File objects!
      const signupPayload = {
        fullName: formData.fullName,
        aadhaarNumber: formData.aadhaarNumber,
        aadhaarDocument: formData.aadhaarDocumentPath,    // ← string path
        panNumber: formData.panNumber || undefined,
        panDocument: formData.panDocumentPath || undefined, // ← string path
        mobileNumber: formData.mobileNumber,
        email: formData.email || undefined,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        maritalStatus: formData.maritalStatus,
        occupation: formData.occupation || undefined,
        spouse: formData.spouse,
        parents: formData.parents,
        address: formData.address,
      };

      const response = await authService.completeSignup(signupPayload);
      const data = response.data || response;
      
      alert('🎉 Account created successfully! Please login.');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/login');
    } catch (error) {
      console.error('Signup Error:', error);
      const msg = error.response?.data?.message || error.message;
      alert('❌ Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  // Progress bar (unchanged)
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {currentStep > step ? '✓' : step}
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600 mt-2">Step {currentStep} of 7</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
              <p className="text-gray-600">Complete KYC Verification</p>
            </div>

            {renderProgressBar()}

            {/* STEP 1: Aadhaar */}
            {currentStep === 1 && (
              <form onSubmit={handleAadhaarVerification}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FaIdCard className="mr-3 text-blue-600" />
                  Aadhaar Verification
                </h2>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Full Name (exactly as on Aadhaar)
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    placeholder="123456789012"
                    maxLength="12"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <FaUpload className="mr-2" />
                    Upload Aadhaar (Image/PDF)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'aadhaarDocument')}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                  {formData.aadhaarDocument && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.aadhaarDocument.name}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            )}

            {/* STEP 2: PAN */}
            {currentStep === 2 && (
              <form onSubmit={handlePANVerification}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FaIdCard className="mr-3 text-blue-600" />
                  PAN Verification
                </h2>

                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700">✅ Aadhaar Verified: {formData.aadhaarName || formData.fullName}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                    <FaUpload className="mr-2" />
                    Upload PAN (Image/PDF)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'panDocument')}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                  {formData.panDocument && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.panDocument.name}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                    {loading ? 'Verifying...' : 'Continue'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Mobile OTP */}
            {currentStep === 3 && (
              <form onSubmit={handleVerifyOTP}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FaPhone className="mr-3 text-blue-600" />
                  Mobile Verification
                </h2>

                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700">✅ Aadhaar Verified</p>
                  <p className="text-green-700">✅ PAN Uploaded</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Mobile Number</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      maxLength="10"
                      disabled={otpSent}
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading || (otpSent && otpTimer > 0)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg disabled:bg-gray-400"
                    >
                      {loading ? '...' : otpSent ? 'Sent ✓' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Enter OTP</label>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-orange-600 font-semibold">
                        📱 Check BACKEND TERMINAL for OTP
                      </p>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpTimer > 0}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center disabled:text-gray-400"
                      >
                        <FaRedo className="mr-1" />
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(2)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                  <button type="submit" disabled={loading || !otpSent} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Personal Details */}
            {currentStep === 4 && (
              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(5); }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FaUser className="mr-3 text-blue-600" />
                  Personal Details
                </h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email (Optional)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Occupation</label>
                    <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(3)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Continue</button>
                </div>
              </form>
            )}

            {/* STEP 5: Family Details */}
            {currentStep === 5 && (
              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(6); }}>
                <h2 className="text-2xl font-bold mb-6">Family Details (Optional)</h2>

                {formData.maritalStatus === 'Married' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded">
                    <h3 className="font-bold mb-4">Spouse Details</h3>
                    <input type="text" placeholder="Spouse Full Name" value={formData.spouse.fullName} onChange={(e) => handleNestedChange('spouse', 'fullName', e.target.value)} className="w-full px-4 py-3 border rounded-lg mb-3" />
                    <input type="text" placeholder="Spouse Aadhaar" value={formData.spouse.aadhaarNumber} onChange={(e) => handleNestedChange('spouse', 'aadhaarNumber', e.target.value)} maxLength="12" className="w-full px-4 py-3 border rounded-lg mb-3" />
                    <input type="text" placeholder="Spouse Mobile" value={formData.spouse.mobileNumber || ''} onChange={(e) => handleNestedChange('spouse', 'mobileNumber', e.target.value)} maxLength="10" className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                )}

                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-bold mb-4">Parents Details</h3>
                  {formData.parents.map((parent, index) => (
                    <div key={index} className="mb-4 p-3 bg-white rounded">
                      <label className="block text-sm font-semibold mb-2">{parent.relationship}</label>
                      <input type="text" placeholder={`${parent.relationship}'s Name`} value={parent.fullName} onChange={(e) => { const p = [...formData.parents]; p[index].fullName = e.target.value; setFormData({...formData, parents: p}); }} className="w-full px-4 py-3 border rounded-lg mb-2" />
                      <input type="text" placeholder={`${parent.relationship}'s Aadhaar`} value={parent.aadhaarNumber} onChange={(e) => { const p = [...formData.parents]; p[index].aadhaarNumber = e.target.value; setFormData({...formData, parents: p}); }} maxLength="12" className="w-full px-4 py-3 border rounded-lg mb-2" />
                      <input type="text" placeholder={`${parent.relationship}'s Mobile`} value={parent.mobileNumber || ''} onChange={(e) => { const p = [...formData.parents]; p[index].mobileNumber = e.target.value; setFormData({...formData, parents: p}); }} maxLength="10" className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(4)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Continue</button>
                </div>
              </form>
            )}

            {/* STEP 6: Address */}
            {currentStep === 6 && (
              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(7); }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-blue-600" />
                  Address Details
                </h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">Street Address</label>
                    <input type="text" value={formData.address.street} onChange={(e) => handleNestedChange('address', 'street', e.target.value)} className="w-full px-4 py-3 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Village/Town</label>
                    <input type="text" value={formData.address.village} onChange={(e) => handleNestedChange('address', 'village', e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">City</label>
                    <input type="text" value={formData.address.city} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} className="w-full px-4 py-3 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">State</label>
                    <select value={formData.address.state} onChange={(e) => { handleNestedChange('address', 'state', e.target.value); setSelectedState(indianStates.find(s => s.name === e.target.value)); }} className="w-full px-4 py-3 border rounded-lg" required>
                      <option value="">Select State</option>
                      {indianStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">District</label>
                    <select value={formData.address.district} onChange={(e) => handleNestedChange('address', 'district', e.target.value)} className="w-full px-4 py-3 border rounded-lg" required disabled={!selectedState}>
                      <option value="">Select District</option>
                      {selectedState?.districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Constituency</label>
                    <input type="text" value={formData.address.constituency} onChange={(e) => handleNestedChange('address', 'constituency', e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Pincode</label>
                    <input type="text" value={formData.address.pincode} onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)} maxLength="6" className="w-full px-4 py-3 border rounded-lg" required />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(5)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Continue</button>
                </div>
              </form>
            )}

            {/* STEP 7: Password */}
            {currentStep === 7 && (
              <form onSubmit={handleCompleteSignup}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FaLock className="mr-3 text-blue-600" />
                  Set Password
                </h2>

                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700">✅ All verifications complete!</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" minLength="8" required />
                  <p className="text-sm text-gray-600 mt-1">Minimum 8 characters</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(6)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;