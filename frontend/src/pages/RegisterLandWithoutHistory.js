import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';
import axios from 'axios';
import { indianStates } from '../data/indianStates';
import { FaUpload, FaCamera, FaCheckCircle } from 'react-icons/fa';

const RegisterLandWithoutHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    claimedOwnerName: user?.fullName || '',
    address: {
      village: '',
      district: '',
      state: '',
      pincode: '',
      exactLocation: ''
    },
    measurements: {
      squareFeet: '',
      squareMeters: '',
      acres: '',
      hectares: ''
    },
    surroundingLands: {
      north: '',
      south: '',
      east: '',
      west: ''
    },
    landDescription: ''
  });

  const [documents, setDocuments] = useState({
    ownershipProof: null,
    ownerLivePhoto: null,
    landPhotos: [],
    surveyMap: null
  });

  const [selectedState, setSelectedState] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e, fieldName) => {
    const files = e.target.files;
    if (fieldName === 'landPhotos') {
      setDocuments({ ...documents, [fieldName]: Array.from(files) });
    } else {
      setDocuments({ ...documents, [fieldName]: files[0] });
    }
  };

  const captureOwnerPhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'owner-photo.jpg', { type: 'image/jpeg' });
        setDocuments({ ...documents, ownerLivePhoto: file });
        setShowCamera(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startResponse = await axios.post(
        'http://localhost:3000/api/land-registration/start',
        { registrationType: 'WITHOUT_HISTORY' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const landRegistrationId = startResponse.data.data._id;

      const submitFormData = new FormData();
      submitFormData.append('landRegistrationId', landRegistrationId);
      submitFormData.append('claimedOwnerName', formData.claimedOwnerName);
      submitFormData.append('address', JSON.stringify(formData.address));
      submitFormData.append('measurements', JSON.stringify(formData.measurements));
      submitFormData.append('surroundingLands', JSON.stringify(formData.surroundingLands));
      submitFormData.append('landDescription', formData.landDescription);

      if (documents.ownershipProof) {
        submitFormData.append('ownershipProof', documents.ownershipProof);
      }
      if (documents.ownerLivePhoto) {
        submitFormData.append('ownerLivePhoto', documents.ownerLivePhoto);
      }
      if (documents.surveyMap) {
        submitFormData.append('surveyMap', documents.surveyMap);
      }
      if (documents.landPhotos.length > 0) {
        documents.landPhotos.forEach(photo => {
          submitFormData.append('landPhotos', photo);
        });
      }

      const submitResponse = await axios.post(
        'http://localhost:3000/api/land-registration/submit-details',
        submitFormData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('✅ Land registration submitted successfully!\n\nNext Steps:\n1. Complete payment of ₹' + submitResponse.data.data.payment.totalAmount.toLocaleString() + '\n2. Attend meeting on ' + new Date(submitResponse.data.data.meeting.scheduledDate).toLocaleDateString());
      
      navigate('/profile');
    } catch (error) {
      console.error('Registration error:', error);
      alert('❌ Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
              currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Basic Info</span>
        <span>Location</span>
        <span>Documents</span>
        <span>Review</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                New Land Registration (Without History)
              </h1>
              <p className="text-gray-600">Register land for the first time</p>
            </div>

            {renderProgressBar()}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Step 1: Basic Information</h2>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Your Name (As Owner) *
                      </label>
                      <input
                        type="text"
                        name="claimedOwnerName"
                        value={formData.claimedOwnerName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Area in Square Feet *
                      </label>
                      <input
                        type="number"
                        name="measurements.squareFeet"
                        value={formData.measurements.squareFeet}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Area in Square Meters *
                      </label>
                      <input
                        type="number"
                        name="measurements.squareMeters"
                        value={formData.measurements.squareMeters}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Acres (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="measurements.acres"
                        value={formData.measurements.acres}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Hectares (Optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="measurements.hectares"
                        value={formData.measurements.hectares}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Land Description *
                      </label>
                      <textarea
                        name="landDescription"
                        value={formData.landDescription}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe the land type, current usage, features, etc."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300"
                  >
                    Continue to Location Details
                  </button>
                </div>
              )}

              {/* Step 2: Location & Boundaries */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Step 2: Location & Boundaries</h2>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Village/Town *
                      </label>
                      <input
                        type="text"
                        name="address.village"
                        value={formData.address.village}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">State *</label>
                      <select
                        name="address.state"
                        value={formData.address.state}
                        onChange={(e) => {
                          handleChange(e);
                          const state = indianStates.find(s => s.name === e.target.value);
                          setSelectedState(state);
                        }}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state.name} value={state.name}>{state.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">District *</label>
                      <select
                        name="address.district"
                        value={formData.address.district}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                        disabled={!selectedState}
                      >
                        <option value="">Select District</option>
                        {selectedState?.districts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Pincode *</label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleChange}
                        maxLength="6"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Exact Location/Landmark *
                      </label>
                      <textarea
                        name="address.exactLocation"
                        value={formData.address.exactLocation}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Nearby landmarks, road names, etc."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-4">Boundary Details (4 Sides)</h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {['north', 'south', 'east', 'west'].map(direction => (
                      <div key={direction}>
                        <label className="block text-gray-700 font-semibold mb-2 capitalize">
                          {direction} Side *
                        </label>
                        <input
                          type="text"
                          name={`surroundingLands.${direction}`}
                          value={formData.surroundingLands[direction]}
                          onChange={handleChange}
                          placeholder="e.g., Road, Field, Building"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                    >
                      Continue to Documents
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Step 3: Upload Documents & Photos</h2>

                  <div className="space-y-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                        <FaUpload className="mr-2" />
                        Ownership Proof * (Any document showing ownership)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'ownershipProof')}
                        className="w-full px-4 py-3 border rounded-lg"
                        required
                      />
                      {documents.ownershipProof && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                          <FaCheckCircle className="mr-2" />
                          {documents.ownershipProof.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                        <FaUpload className="mr-2" />
                        Survey Map (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'surveyMap')}
                        className="w-full px-4 py-3 border rounded-lg"
                      />
                      {documents.surveyMap && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                          <FaCheckCircle className="mr-2" />
                          {documents.surveyMap.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                        <FaCamera className="mr-2" />
                        Owner Live Photo *
                      </label>

                      {!documents.ownerLivePhoto && !showCamera && (
                        <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center"
                        >
                          <FaCamera className="mr-2" />
                          Capture Live Photo
                        </button>
                      )}

                      {showCamera && (
                        <div>
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="rounded-lg mb-4 w-full"
                          />
                          <div className="flex space-x-4">
                            <button
                              type="button"
                              onClick={captureOwnerPhoto}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                            >
                              Capture
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCamera(false)}
                              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {documents.ownerLivePhoto && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 flex items-center mb-2">
                            <FaCheckCircle className="mr-2" />
                            Photo captured
                          </p>
                          <img
                            src={URL.createObjectURL(documents.ownerLivePhoto)}
                            alt="Owner"
                            className="w-48 h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDocuments({ ...documents, ownerLivePhoto: null });
                              setShowCamera(true);
                            }}
                            className="mt-2 text-green-600 hover:text-green-800"
                          >
                            Retake
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                        <FaUpload className="mr-2" />
                        Land Photos * (Multiple - at least 4 angles)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, 'landPhotos')}
                        className="w-full px-4 py-3 border rounded-lg"
                        required
                      />
                      {documents.landPhotos.length > 0 && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                          <FaCheckCircle className="mr-2" />
                          {documents.landPhotos.length} photo(s) selected
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Please upload photos from all 4 sides of the land
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                      disabled={!documents.ownershipProof || !documents.ownerLivePhoto || documents.landPhotos.length < 4}
                    >
                      Review & Submit
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Step 4: Review Your Information</h2>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">Owner Information</h3>
                      <p><span className="font-semibold">Name:</span> {formData.claimedOwnerName}</p>
                      <p><span className="font-semibold">Area:</span> {formData.measurements.squareFeet} sq ft / {formData.measurements.squareMeters} sq m</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">Location</h3>
                      <p>{formData.address.village}, {formData.address.district}, {formData.address.state} - {formData.address.pincode}</p>
                      <p className="text-sm text-gray-600">{formData.address.exactLocation}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">Documents</h3>
                      <p>✓ Ownership Proof: {documents.ownershipProof?.name}</p>
                      {documents.surveyMap && <p>✓ Survey Map: {documents.surveyMap.name}</p>}
                      <p>✓ Owner Live Photo: Captured</p>
                      <p>✓ Land Photos: {documents.landPhotos.length} photo(s)</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mb-6">
                    <h4 className="font-bold text-blue-900 mb-2">📋 Next Steps</h4>
                    <ol className="list-decimal list-inside text-blue-800 text-sm space-y-1">
                      <li>Registrar will verify all documents</li>
                      <li>Field visit may be scheduled</li>
                      <li>Payment details will be provided</li>
                      <li>Meeting will be arranged for final approval</li>
                      <li>Land will be registered on blockchain after approval</li>
                    </ol>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400"
                    >
                      {loading ? 'Submitting...' : 'Submit Registration'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterLandWithoutHistory;
