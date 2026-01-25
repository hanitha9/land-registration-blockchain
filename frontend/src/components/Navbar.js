import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaPlus, FaList, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/login');
  };

  // Handle profile click
  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaHome className="text-white text-2xl" />
            <span className="text-white text-2xl font-bold">Land Registry</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Home - Always visible */}
            <Link 
              to="/" 
              className="text-white hover:text-blue-200 transition duration-300 flex items-center space-x-2"
            >
              <FaHome />
              <span>Home</span>
            </Link>
            
            {user ? (
              <>
                {/* Dashboard - Only when logged in */}
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-blue-200 transition duration-300 flex items-center space-x-2"
                >
                  <FaList />
                  <span>Dashboard</span>
                </Link>
                
                {/* Register Land - Only when logged in */}
                <Link 
                  to="/register-land" 
                  className="text-white hover:text-blue-200 transition duration-300 flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Register Land</span>
                </Link>
                
                {/* Profile Dropdown - Only when logged in */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="text-white hover:text-blue-200 transition duration-300 flex items-center space-x-2 focus:outline-none"
                  >
                    <FaUser />
                    <span>Profile</span>
                    <FaChevronDown className={`text-sm transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"
                      >
                        <FaUser className="text-blue-600" />
                        <span>My Profile</span>
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center space-x-2"
                      >
                        <FaSignOutAlt className="text-red-600" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login - Only when NOT logged in */}
                <Link 
                  to="/login" 
                  className="text-white hover:text-blue-200 transition duration-300 flex items-center space-x-2"
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
                
                {/* Sign Up - Only when NOT logged in */}
                <Link 
                  to="/signup" 
                  className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold transition duration-300 flex items-center space-x-2"
                >
                  <FaUserPlus />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
