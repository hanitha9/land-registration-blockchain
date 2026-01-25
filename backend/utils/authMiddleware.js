const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authority only middleware
exports.authorityOnly = async (req, res, next) => {
  if (req.user.role !== 'AUTHORITY') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Authority only.'
    });
  }
  next();
};

// User only middleware
exports.userOnly = async (req, res, next) => {
  if (req.user.role !== 'USER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Users only.'
    });
  }
  next();
};
