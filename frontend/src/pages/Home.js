import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaCheckCircle, FaUsers, FaLandmark } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get Started button click
  const handleGetStarted = () => {
    if (user) {
      navigate('/profile');  // After login → Profile
    } else {
      navigate('/login');    // Before login → Login
    }
  };

  // Register Land button click
  const handleRegisterLand = () => {
    if (user) {
      navigate('/register-land');  // After login → Register Land
    } else {
      navigate('/login');          // Before login → Login
    }
  };

  // Feature card click
  const handleFeatureClick = () => {
    if (user) {
      navigate('/profile');  // After login → Profile
    } else {
      navigate('/login');    // Before login → Login
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            Secure Land Registry on Blockchain
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transparent, Tamper-Proof, and Decentralized Land Ownership Records
          </p>
          
          <div className="space-x-4">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
            >
              Get Started
            </button>
            <button
              onClick={handleRegisterLand}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
            >
              Register Land
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <FaShieldAlt className="text-5xl text-blue-600" />,
              title: 'Secure & Immutable',
              description: 'Records stored on blockchain cannot be altered or tampered with'
            },
            {
              icon: <FaCheckCircle className="text-5xl text-green-600" />,
              title: 'KYC Verified',
              description: 'Aadhaar and PAN verification ensures authentic ownership'
            },
            {
              icon: <FaUsers className="text-5xl text-purple-600" />,
              title: 'Multi-Organization',
              description: 'Verified by multiple government authorities'
            },
            {
              icon: <FaLandmark className="text-5xl text-orange-600" />,
              title: 'Easy Transfers',
              description: 'Transparent and quick land ownership transfers'
            }
          ].map((feature, index) => (
            <div
              key={index}
              onClick={handleFeatureClick}
              className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition duration-300 cursor-pointer transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of users securing their land records on blockchain</p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
          >
            {user ? 'Go to Profile' : 'Login / Sign Up'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Land Registry Blockchain. All rights reserved.</p>
          <p className="mt-2 text-gray-400">Powered by Hyperledger Fabric</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
