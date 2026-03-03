import React, { useState } from 'react';
import { landApi } from '../../services/landApi';
import { useNavigate } from 'react-router-dom';

const RequestLandRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    surveyNumber: '',
    location: { village: '', district: '', state: '', pincode: '' },
    areaSqFt: '',
    landType: 'Residential',
    marketValue: '',
    landDocument: null,
    landPhotos: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const files = Array.from(e.target.files);
    if (fieldName === 'landPhotos') {
      setFormData(prev => ({ ...prev, [fieldName]: files }));
    } else {
      setFormData(prev => ({ ...prev, [fieldName]: files[0] || null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('surveyNumber', formData.surveyNumber);
      formDataToSend.append('location[village]', formData.location.village);
      formDataToSend.append('location[district]', formData.location.district);
      formDataToSend.append('location[state]', formData.location.state);
      formDataToSend.append('location[pincode]', formData.location.pincode);
      formDataToSend.append('areaSqFt', formData.areaSqFt);
      formDataToSend.append('landType', formData.landType);
      formDataToSend.append('marketValue', formData.marketValue);

      if (formData.landDocument) {
        formDataToSend.append('landDocument', formData.landDocument);
      }
      formData.landPhotos.forEach(photo => {
        formDataToSend.append('landPhotos', photo);
      });

      await landApi.requestLandRegistration(formDataToSend);
      setSuccess('Land registration request submitted successfully! Pending revenue officer verification.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Request Land Registration</h3>
          <p className="mt-1 text-sm text-gray-500">Submit a request to register a new land property</p>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Survey Number + Land Type */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Survey Number *</label>
                <input type="text" name="surveyNumber" value={formData.surveyNumber} onChange={handleChange} required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Land Type</label>
                <select name="landType" value={formData.landType} onChange={handleChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option>Residential</option>
                  <option>Agricultural</option>
                  <option>Commercial</option>
                  <option>Industrial</option>
                </select>
              </div>
            </div>

            {/* Area + Market Value */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Area (Square Feet) *</label>
                <input type="number" name="areaSqFt" value={formData.areaSqFt} onChange={handleChange} required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Market Value (₹) *</label>
                <input type="number" name="marketValue" value={formData.marketValue} onChange={handleChange} required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Location Details</h4>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  { label: 'Village/Town', name: 'location.village', value: formData.location.village },
                  { label: 'District', name: 'location.district', value: formData.location.district },
                  { label: 'State', name: 'location.state', value: formData.location.state },
                  { label: 'Pincode', name: 'location.pincode', value: formData.location.pincode },
                ].map(({ label, name, value }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700">{label} *</label>
                    <input type="text" name={name} value={value} onChange={handleChange} required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Document Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Document Upload</h4>
              <div className="space-y-4">

                {/* Land Document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Document (PDF/Image)</label>
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    formData.landDocument ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{formData.landDocument ? '✅' : '📄'}</span>
                        <div>
                          {formData.landDocument ? (
                            <>
                              <p className="text-sm font-semibold text-green-700">{formData.landDocument.name}</p>
                              <p className="text-xs text-green-600">
                                {(formData.landDocument.size / 1024).toFixed(1)} KB — Ready to upload
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600">No file selected</p>
                              <p className="text-xs text-gray-400">PDF, JPG, PNG up to 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                      <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors">
                        {formData.landDocument ? 'Change' : 'Choose File'}
                        <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(e, 'landDocument')} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Land Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Photos (Multiple)</label>
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    formData.landPhotos.length > 0 ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{formData.landPhotos.length > 0 ? '🖼️' : '📷'}</span>
                        <div>
                          {formData.landPhotos.length > 0 ? (
                            <>
                              <p className="text-sm font-semibold text-green-700">
                                {formData.landPhotos.length} photo{formData.landPhotos.length > 1 ? 's' : ''} selected
                              </p>
                              <p className="text-xs text-green-600">
                                {formData.landPhotos.map(f => f.name).join(', ')}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600">No photos selected</p>
                              <p className="text-xs text-gray-400">JPG, PNG up to 5MB each</p>
                            </>
                          )}
                        </div>
                      </div>
                      <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors">
                        {formData.landPhotos.length > 0 ? 'Change' : 'Choose Photos'}
                        <input type="file" className="sr-only" accept=".jpg,.jpeg,.png" multiple
                          onChange={(e) => handleFileChange(e, 'landPhotos')} />
                      </label>
                    </div>

                    {/* Photo preview thumbnails */}
                    {formData.landPhotos.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.landPhotos.map((photo, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`preview-${idx}`}
                              className="w-16 h-16 object-cover rounded-md border border-green-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => navigate('/dashboard')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestLandRegistration;