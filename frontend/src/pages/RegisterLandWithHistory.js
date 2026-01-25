import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';
import axios from 'axios';
import { indianStates } from '../data/indianStates';
import { FaCamera, FaUpload, FaMapMarkerAlt, FaRuler, FaCompass } from 'react-icons/fa';

const RegisterLandWithHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const [formData, setFormData] = useState({
    surveyNumber: '',
    claimedOwnerName: user?.fullName || '',
    ownerLivePhoto: null,
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
    documents: {
      landDocument: null,
      previousOwnerDocument: null,
      landPhotos: []
    }
  });

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
    const files = e.target.files;
    if (fieldName === 'landPhotos') {
      const photosArray = Array.from(files);
      setFormData({
        ...formData,
        documents: { ...formData.documents, landPhotos: photosArray }
      });
    } else {
      setFormData({
        ...formData,
        documents: { ...formData.documents, [fieldName]: files[0] }
      });
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedPhoto(imageSrc);
    setShowCamera(false);
  };

  const convertToFile = async (base64Image) => {
    const response = await fetch(base64Image);
    const blob = await response.blob();
    return new File([blob], 'owner_photo.jpg', { type: 'image/jpeg' });
  };

  // Auto-calculate measurements
  const handleMeasurementChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const newMeasurements = { ...formData.measurements };

    if (field === 'squareFeet') {
      newMeasurements.squareFeet = value;
      newMeasurements.squareMeters = (numValue * 0.092903).toFixed(2);
      newMeasurements.acres = (numValue / 43560).toFixed(4);
      newMeasurements.hectares = (numValue * 0.092903 / 10000).toFixed(4);
    } else if (field === 'squareMeters') {
      newMeasurements.squareMeters = value;
      newMeasurements.squareFeet = (numValue / 0.092903).toFixed(2);
      newMeasurements.acres = (numValue / 4046.86).toFixed(4);
      newMeasurements.hectares = (numValue / 10000).toFixed(4);
    }

    setFormData({ ...formData, measurements: newMeasurements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!capturedPhoto) {
      alert('Please capture your live photo');
      return;
    }

    setLoading(true);

    try {
      // First, start the registration
      const startResponse = await axios.post(
        'http://localhost:3000/api/land-registration/start',
        { registrationType: 'WITH_HISTORY' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const landRegistrationId = startResponse.data.data._id;

      // Prepare form data for file upload
      const submitFormData = new FormData();
      submitFormData.append('landRegistrationId', landRegistrationId);
      submitFormData.append('surveyNumber', formData.surveyNumber);
      submitFormData.append('claimedOwnerName', formData.claimedOwnerName);
      submitFormData.append('address', JSON.stringify(formData.address));
      submitFormData.append('measurements', JSON.stringify(formData.measurements));
      submitFormData.append('surroundingLands', JSON.stringify(formData.surroundingLands));

      // Convert captured photo to file
      const ownerPhotoFile = await convertToFile(capturedPhoto);
      submitFormData.append('ownerLivePhoto', ownerPhotoFile);

      // Append documents
      if (formData.documents.landDocument) {
        submitFormData.append('landDocument', formData.documents.landDocument);
      }
      if (formData.documents.previousOwnerDocument) {
        submitFormData.append('previousOwnerDocument', formData.documents.previousOwnerDocument);
      }
      if (formData.documents.landPhotos.length > 0) {
        formData.documents.landPhotos.forEach((photo) => {
          submitFormData.append('landPhotos', photo);
        });
      }

      // Submit land details
      const response = await axios.post(
        'http://localhost:3000/api/land-registration/submit-details',
        submitFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('✅ Land registration submitted successfully!');
      
      // Navigate to payment page with the land registration data
      navigate('/payment', { 
        state: { 
          landRegistration: response.data.data,
          landRegistrationId: landRegistrationId
        } 
      });

    } catch (error) {
      console.error('Registration Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
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
        Step {currentStep} of 5
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Register Land with History
              </h1>
              <p className="text-gray-600">Complete all steps to register your land</p>
            </div>

            {renderProgressBar()}

            <form onSubmit={handleSubmit}>
              {/* STEP 1: Survey Details & Owner Info */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Step 1: Basic Information</h2>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Survey Number *
                    </label>
                    <input
                      type="text"
                      name="surveyNumber"
                      value={formData.surveyNumber}
                      onChange={handleChange}
                      placeholder="e.g., 123/4A"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Property Owner Name (Claiming) *
                    </label>
                    <input
                      type="text"
                      name="claimedOwnerName"
                      value={formData.claimedOwnerName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center">
                      <FaCamera className="mr-2" />
                      Live Photo of Owner *
                    </label>
                    
                    {!showCamera && !capturedPhoto && (
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
                      >
                        <FaCamera className="mr-2" />
                        Capture Live Photo
                      </button>
                    )}

                    {showCamera && (
                      <div className="mb-4">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-full rounded-lg mb-4"
                        />
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                          >
                            Capture
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCamera(false)}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {capturedPhoto && (
                      <div className="mb-4">
                        <img
                          src={capturedPhoto}
                          alt="Captured"
                          className="w-48 h-48 rounded-lg object-cover mb-4"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCapturedPhoto(null);
                            setShowCamera(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Retake Photo
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.surveyNumber || !formData.claimedOwnerName || !capturedPhoto}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400"
                  >
                    Continue to Address Details
                  </button>
                </div>
              )}

              {/* STEP 2: Address Details */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FaMapMarkerAlt className="mr-3 text-blue-600" />
                    Step 2: Address Details
                  </h2>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Village/Town *</label>
                      <input
                        type="text"
                        value={formData.address.village}
                        onChange={(e) => handleNestedChange('address', 'village', e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">State *</label>
                      <select
                        value={formData.address.state}
                        onChange={(e) => {
                          handleNestedChange('address', 'state', e.target.value);
                          const state = indianStates.find(s => s.name === e.target.value);
                          setSelectedState(state);
                        }}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        value={formData.address.district}
                        onChange={(e) => handleNestedChange('address', 'district', e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        value={formData.address.pincode}
                        onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
                        maxLength="6"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">Exact Location Details</label>
                      <textarea
                        value={formData.address.exactLocation}
                        onChange={(e) => handleNestedChange('address', 'exactLocation', e.target.value)}
                        placeholder="Provide detailed location information..."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Land Measurements */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FaRuler className="mr-3 text-blue-600" />
                    Step 3: Land Measurements
                  </h2>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Square Feet *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.measurements.squareFeet}
                        onChange={(e) => handleMeasurementChange('squareFeet', e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Square Meters</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.measurements.squareMeters}
                        onChange={(e) => handleMeasurementChange('squareMeters', e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Acres</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.measurements.acres}
                        className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Hectares</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.measurements.hectares}
                        className="w-full px-4 py-3 border rounded-lg bg-gray-50"
                        readOnly
                      />
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
                      disabled={!formData.measurements.squareFeet}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Surrounding Lands */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FaCompass className="mr-3 text-blue-600" />
                    Step 4: Surrounding Land Details
                  </h2>

                  <p className="text-gray-600 mb-6">
                    Provide details about the lands/properties on all four sides of your property
                  </p>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">North Side *</label>
                      <input
                        type="text"
                        value={formData.surroundingLands.north}
                        onChange={(e) => handleNestedChange('surroundingLands', 'north', e.target.value)}
                        placeholder="e.g., Road, Owner Name, Survey No."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">South Side *</label>
                      <input
                        type="text"
                        value={formData.surroundingLands.south}
                        onChange={(e) => handleNestedChange('surroundingLands', 'south', e.target.value)}
                        placeholder="e.g., Road, Owner Name, Survey No."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">East Side *</label>
                      <input
                        type="text"
                        value={formData.surroundingLands.east}
                        onChange={(e) => handleNestedChange('surroundingLands', 'east', e.target.value)}
                        placeholder="e.g., Road, Owner Name, Survey No."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">West Side *</label>
                      <input
                        type="text"
                        value={formData.surroundingLands.west}
                        onChange={(e) => handleNestedChange('surroundingLands', 'west', e.target.value)}
                        placeholder="e.g., Road, Owner Name, Survey No."
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
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
                      type="button"
                      onClick={() => setCurrentStep(5)}
className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
>
Continue
</button>
</div>
</div>
)}
          {/* STEP 5: Document Uploads */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaUpload className="mr-3 text-blue-600" />
                Step 5: Upload Documents
              </h2>

              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Current Land Document * (Survey Map, Patta, etc.)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'landDocument')}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                  {formData.documents.landDocument && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {formData.documents.landDocument.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Previous Owner Document (Sale Deed, Transfer Deed)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'previousOwnerDocument')}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  {formData.documents.previousOwnerDocument && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {formData.documents.previousOwnerDocument.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Land Photos (Multiple allowed)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'landPhotos')}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  {formData.documents.landPhotos.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {formData.documents.landPhotos.length} photo(s) selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.documents.landDocument}
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
export default RegisterLandWithHistory;
