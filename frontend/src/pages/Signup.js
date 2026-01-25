import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authApi';
import { indianStates } from '../data/indianStates';
import { FaUser, FaIdCard, FaPhone, FaLock, FaCheckCircle, FaUpload, FaMapMarkerAlt } from 'react-icons/fa';

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: '',
    aadhaarDocument: null,
    aadhaarVerified: false,
    aadhaarName: '',
    panNumber: '',
    panDocument: null,
    panVerified: false,
    panName: '',
    mobileNumber: '',
    otp: '',
    mobileVerified: false,
    email: '',
    dateOfBirth: '',
    maritalStatus: 'Single',
    occupation: '',
    spouse: { fullName: '', aadhaarNumber: '' },
    children: [],
    parents: [
      { fullName: '', aadhaarNumber: '', relationship: 'Father' },
      { fullName: '', aadhaarNumber: '', relationship: 'Mother' }
    ],
    address: {
      street: '',
      village: '',
      city: '',
      constituency: '',
      district: '',
      state: '',
      pincode: ''
    },
    password: '',
    confirmPassword: ''
  });

  const [selectedState, setSelectedState] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

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

  // Step 1: Verify Aadhaar
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
      
      setFormData({
        ...formData,
        aadhaarVerified: response.data.verified,
        aadhaarName: response.data.extractedName,
        aadhaarDocument: response.data.aadhaarDocument
      });

      if (response.data.verified) {
        alert('✅ Aadhaar verified successfully!');
        setCurrentStep(2);
      } else {
        alert('⚠️ Name verification: Extracted name - "' + response.data.extractedName + '". You can proceed, but ensure details are correct.');
        setCurrentStep(2);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify PAN
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
      
      setFormData({
        ...formData,
        panVerified: response.data.verified,
        panName: response.data.extractedName,
        panDocument: response.data.panDocument
      });

      alert('✅ PAN document uploaded. Proceeding to next step.');
      setCurrentStep(3);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Send OTP
  const handleSendOTP = async () => {
    if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOTP(formData.mobileNumber);
      setOtpSent(true);
      alert('✅ OTP sent! Check the backend console/terminal for the OTP code.');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await authService.verifyOTP(formData.mobileNumber, formData.otp);
      
      if (response.success) {
        setFormData({ ...formData, mobileVerified: true });
        alert('✅ Mobile number verified!');
        setCurrentStep(4);
      } else {
        alert('❌ Invalid OTP. Please try again.');
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Complete Signup
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

    setLoading(true);
    try {
      const response = await authService.completeSignup(formData);
      
      alert('🎉 Account created successfully! Please login.');
      localStorage.setItem('token', response.token);
      navigate('/login');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              currentStep >= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600 mt-2">
        Step {currentStep} of 7
      </div>
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
                  <label className="block text-gray-700 font-semibold mb-2">Full Name (as per Aadhaar)</label>
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

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">
                    Back
                  </button>
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
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading || otpSent}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg disabled:bg-gray-400"
                    >
                      {otpSent ? 'Sent ✓' : 'Send OTP'}
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
                      placeholder="6-digit OTP"
                      maxLength="6"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-sm text-orange-600 mt-2 font-semibold">
                      📱 Check the backend terminal for OTP (Development Mode)
                    </p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(2)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">
                    Back
                  </button>
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
        <input
          type="text"
          placeholder="Spouse Full Name"
          value={formData.spouse.fullName}
          onChange={(e) => handleNestedChange('spouse', 'fullName', e.target.value)}
          className="w-full px-4 py-3 border rounded-lg mb-3"
        />
        <input
          type="text"
          placeholder="Spouse Aadhaar Number"
          value={formData.spouse.aadhaarNumber}
          onChange={(e) => handleNestedChange('spouse', 'aadhaarNumber', e.target.value)}
          maxLength="12"
          className="w-full px-4 py-3 border rounded-lg mb-3"
        />
        <input
          type="text"
          placeholder="Spouse Mobile Number"
          value={formData.spouse.mobileNumber || ''}
          onChange={(e) => handleNestedChange('spouse', 'mobileNumber', e.target.value)}
          maxLength="10"
          className="w-full px-4 py-3 border rounded-lg"
        />
      </div>
    )}

    <div className="mb-6 p-4 bg-gray-50 rounded">
      <h3 className="font-bold mb-4">Parents/Guardian Details</h3>
      {formData.parents.map((parent, index) => (
        <div key={index} className="mb-4 p-3 bg-white rounded">
          <label className="block text-sm font-semibold mb-2">{parent.relationship}</label>
          <input
            type="text"
            placeholder={`${parent.relationship}'s Full Name`}
            value={parent.fullName}
            onChange={(e) => {
              const newParents = [...formData.parents];
              newParents[index].fullName = e.target.value;
              setFormData({ ...formData, parents: newParents });
            }}
            className="w-full px-4 py-3 border rounded-lg mb-2"
          />
          <input
            type="text"
            placeholder={`${parent.relationship}'s Aadhaar Number`}
            value={parent.aadhaarNumber}
            onChange={(e) => {
              const newParents = [...formData.parents];
              newParents[index].aadhaarNumber = e.target.value;
              setFormData({ ...formData, parents: newParents });
            }}
            maxLength="12"
            className="w-full px-4 py-3 border rounded-lg mb-2"
          />
          <input
            type="text"
            placeholder={`${parent.relationship}'s Mobile Number`}
            value={parent.mobileNumber || ''}
            onChange={(e) => {
              const newParents = [...formData.parents];
              newParents[index].mobileNumber = e.target.value;
              setFormData({ ...formData, parents: newParents });
            }}
            maxLength="10"
            className="w-full px-4 py-3 border rounded-lg"
          />
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
                    <select value={formData.address.state} onChange={(e) => {
                      handleNestedChange('address', 'state', e.target.value);
                      const state = indianStates.find(s => s.name === e.target.value);
                      setSelectedState(state);
                    }} className="w-full px-4 py-3 border rounded-lg" required>
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state.name} value={state.name}>{state.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">District</label>
                    <select value={formData.address.district} onChange={(e) => handleNestedChange('address', 'district', e.target.value)} className="w-full px-4 py-3 border rounded-lg" required disabled={!selectedState}>
                      <option value="">Select District</option>
                      {selectedState?.districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
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

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" minLength="8" required />
                  <p className="text-sm text-gray-600 mt-1">Minimum 8 characters</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={() => setCurrentStep(6)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                    {loading ? 'Creating Account...' : 'Create Account'}
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
