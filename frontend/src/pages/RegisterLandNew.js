import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHistory, FaFileAlt, FaArrowRight } from 'react-icons/fa';

const RegisterLandNew = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption === 'WITH_HISTORY') {
      navigate('/register-land/with-history');
    } else if (selectedOption === 'WITHOUT_HISTORY') {
      navigate('/register-land/without-history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Register Your Land</h1>
            <p className="text-xl text-gray-600">Choose the type of land registration</p>
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Option 1: With History */}
            <div
              onClick={() => handleOptionSelect('WITH_HISTORY')}
              className={`bg-white rounded-lg shadow-lg p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedOption === 'WITH_HISTORY' 
                  ? 'ring-4 ring-blue-500 shadow-2xl' 
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  selectedOption === 'WITH_HISTORY' ? 'bg-blue-600' : 'bg-blue-100'
                }`}>
                  <FaHistory className={`text-4xl ${
                    selectedOption === 'WITH_HISTORY' ? 'text-white' : 'text-blue-600'
                  }`} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-4">
                Land with Registration History
              </h2>

              <p className="text-gray-600 text-center mb-6">
                For land that has been previously registered or transferred. You have documents from previous owners.
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="font-semibold text-blue-900 mb-2">Required Documents:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Previous registration documents</li>
                  <li>✓ Sale deed / Transfer deed</li>
                  <li>✓ Chain of ownership documents</li>
                  <li>✓ Current survey documents</li>
                  <li>✓ Tax receipts</li>
                </ul>
              </div>

              {selectedOption === 'WITH_HISTORY' && (
                <div className="text-center">
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    ✓ Selected
                  </span>
                </div>
              )}
            </div>

            {/* Option 2: Without History */}
            <div
              onClick={() => handleOptionSelect('WITHOUT_HISTORY')}
              className={`bg-white rounded-lg shadow-lg p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedOption === 'WITHOUT_HISTORY' 
                  ? 'ring-4 ring-purple-500 shadow-2xl' 
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  selectedOption === 'WITHOUT_HISTORY' ? 'bg-purple-600' : 'bg-purple-100'
                }`}>
                  <FaFileAlt className={`text-4xl ${
                    selectedOption === 'WITHOUT_HISTORY' ? 'text-white' : 'text-purple-600'
                  }`} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-4">
                Land without Registration History
              </h2>

              <p className="text-gray-600 text-center mb-6">
                For newly surveyed land, inherited land, or land with no previous registration records.
              </p>

              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="font-semibold text-purple-900 mb-2">Required Documents:</p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Fresh survey documents</li>
                  <li>✓ Proof of ownership claim</li>
                  <li>✓ Identity documents</li>
                  <li>✓ Affidavit (if applicable)</li>
                  <li>✓ Village records</li>
                </ul>
              </div>

              {selectedOption === 'WITHOUT_HISTORY' && (
                <div className="text-center">
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    ✓ Selected
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded">
            <h3 className="font-bold text-yellow-900 mb-2">📌 Important Information</h3>
            <ul className="text-yellow-800 space-y-2 text-sm">
              <li>• All documents will be verified by government authorities</li>
              <li>• Payment will be calculated based on land area and location</li>
              <li>• Physical verification meeting will be scheduled</li>
              <li>• Registration process typically takes 7-15 working days</li>
              <li>• Ensure all documents are authentic and up-to-date</li>
            </ul>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedOption}
              className={`px-12 py-4 rounded-lg font-bold text-lg flex items-center space-x-3 mx-auto transition-all duration-300 ${
                selectedOption
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Registration</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterLandNew;
