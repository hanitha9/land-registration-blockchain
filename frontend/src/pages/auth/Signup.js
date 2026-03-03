// frontend/src/pages/auth/Signup.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authApi';

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: '',
    aadhaarDocument: null,
    aadhaarDocumentPath: '',  // stores server path returned after Aadhaar verification
    panNumber: '',
    panDocument: null,
    panDocumentPath: '',      // stores server path returned after PAN verification
    mobileNumber: '',
    otp: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    maritalStatus: 'Single',
    occupation: '',
    address: {
      street: '',
      village: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      setError('');
    }
  };

  const handleNext = () => {
    setError('');
    setSuccess('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setSuccess('');
    setCurrentStep(prev => prev - 1);
  };

  // Step 2: Verify Aadhaar
  const submitAadhaar = async () => {
    if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    if (!formData.aadhaarDocument) {
      setError('Please upload your Aadhaar document');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('aadhaarNumber', formData.aadhaarNumber);
      data.append('aadhaarDocument', formData.aadhaarDocument);

      const response = await authService.verifyAadhaar(data);

      // Debug: log full response to browser console
      console.log('AADHAAR RESPONSE:', JSON.stringify(response, null, 2));

      // ✅ FIX: axios wraps body in response.data, backend wraps path in data{}
      // So full path is response.data.data.aadhaarDocument
      const docPath = response?.data?.data?.aadhaarDocument
        || response?.data?.aadhaarDocument
        || '';

      console.log('Extracted aadhaarDocumentPath:', docPath);

      setFormData(prev => ({
        ...prev,
        aadhaarDocumentPath: docPath
      }));

      setSuccess('Aadhaar verified successfully!');
      setTimeout(() => { setSuccess(''); handleNext(); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Aadhaar verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify PAN
  const submitPAN = async () => {
    if (!formData.panNumber) {
      setError('Please enter your PAN number');
      return;
    }
    if (!formData.panDocument) {
      setError('Please upload your PAN document');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('panNumber', formData.panNumber);
      data.append('panDocument', formData.panDocument);

      const response = await authService.verifyPAN(data);

      // Debug: log full response to browser console
      console.log('PAN RESPONSE:', JSON.stringify(response, null, 2));

      // ✅ FIX: same axios nesting fix as Aadhaar
      const docPath = response?.data?.data?.panDocument
        || response?.data?.panDocument
        || '';

      console.log('Extracted panDocumentPath:', docPath);

      setFormData(prev => ({
        ...prev,
        panDocumentPath: docPath
      }));

      setSuccess('PAN verified successfully!');
      setTimeout(() => { setSuccess(''); handleNext(); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'PAN verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Send OTP
  const sendOTP = async () => {
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.sendOTP({ mobileNumber: formData.mobileNumber });
      setOtpSent(true);
      setSuccess('OTP sent! Check the backend terminal for the OTP code.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Verify OTP
  const verifyOTP = async () => {
    if (!formData.otp) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.verifyOTP({
        mobileNumber: formData.mobileNumber,
        otp: formData.otp
      });
      setSuccess('Mobile verified successfully!');
      setTimeout(() => { setSuccess(''); handleNext(); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Complete Signup
  const completeSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.completeSignup({
        fullName: formData.fullName,
        aadhaarNumber: formData.aadhaarNumber,
        aadhaarDocument: formData.aadhaarDocumentPath,  // server path string
        panNumber: formData.panNumber,
        panDocument: formData.panDocumentPath,          // server path string
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        occupation: formData.occupation,
        address: formData.address
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  // Reusable file upload field with filename preview
  const FileUploadField = ({ label, fieldName }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
        <div className="space-y-1 text-center">
          {formData[fieldName] ? (
            <div className="flex flex-col items-center space-y-2">
              <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-600 font-medium">{formData[fieldName].name}</p>
              <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-500 underline">
                Change file
                <input type="file" onChange={(e) => handleFileChange(e, fieldName)} className="sr-only" accept=".jpg,.jpeg,.png,.pdf" />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  <span>Upload a file</span>
                  <input type="file" onChange={(e) => handleFileChange(e, fieldName)} className="sr-only" accept=".jpg,.jpeg,.png,.pdf" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Step {currentStep} of 7</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step ? 'bg-green-500 text-white' :
                    currentStep === step ? 'bg-indigo-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Occupation</label>
                    <input type="text" name="occupation" value={formData.occupation} onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
                <div className="mt-6">
                  <button type="button" onClick={() => {
                    if (!formData.fullName) { setError('Please enter your full name'); return; }
                    if (!formData.dateOfBirth) { setError('Please enter your date of birth'); return; }
                    handleNext();
                  }} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Aadhaar Verification */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Aadhaar Verification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                    <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange}
                      required maxLength="12" placeholder="12-digit Aadhaar number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <FileUploadField label="Aadhaar Document" fieldName="aadhaarDocument" />
                </div>
                <div className="mt-6 flex space-x-3">
                  <button type="button" onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
                  <button type="button" onClick={submitAadhaar} disabled={loading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: PAN Verification */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">PAN Verification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                    <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange}
                      required maxLength="10" placeholder="e.g. ABCDE1234F"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase" />
                  </div>
                  <FileUploadField label="PAN Document" fieldName="panDocument" />
                </div>
                <div className="mt-6 flex space-x-3">
                  <button type="button" onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
                  <button type="button" onClick={submitPAN} disabled={loading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Mobile Verification */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mobile Verification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">+91</span>
                      <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
                        required maxLength="10" placeholder="10-digit mobile number"
                        className="flex-1 block w-full border border-gray-300 rounded-none rounded-r-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                  </div>
                  <button type="button" onClick={sendOTP} disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                    {loading && !otpSent ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                  {otpSent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                      <input type="text" name="otp" value={formData.otp} onChange={handleChange}
                        required maxLength="6" placeholder="6-digit OTP"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">💡 Check backend terminal for OTP (Twilio not configured)</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex space-x-3">
                  <button type="button" onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
                  {otpSent && (
                    <button type="button" onClick={verifyOTP} disabled={loading}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Email */}
            {currentStep === 5 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Address</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-gray-400">(optional)</span>
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="mt-6 flex space-x-3">
                  <button type="button" onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
                  <button type="button" onClick={handleNext}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Continue</button>
                </div>
              </div>
            )}

            {/* Step 6: Address */}
            {currentStep === 6 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input type="text" name="address.street" value={formData.address.street} onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Village/Town</label>
                      <input type="text" name="address.village" value={formData.address.village} onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input type="text" name="address.city" value={formData.address.city} onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">District</label>
                      <input type="text" name="address.district" value={formData.address.district} onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input type="text" name="address.state" value={formData.address.state} onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange}
                      maxLength="6"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button type="button" onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
                  <button type="button" onClick={handleNext}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Continue</button>
                </div>
              </div>
            )}

            {/* Step 7: Password */}
            {currentStep === 7 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Set Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                      required minLength="8"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button type="button" onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
                  <button type="button" onClick={completeSignup} disabled={loading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Sign in
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;