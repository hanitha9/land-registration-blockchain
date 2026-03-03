// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ✅ FIX 1: Import as instances, NOT destructured — class methods need 'this' context
const ocrService = require('../services/ocrService');
const otpService = require('../services/otpService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Step 1: Verify Aadhaar
exports.signupStep1 = async (req, res) => {
  try {
    const { fullName, aadhaarNumber } = req.body;
    const files = req.files;

    console.log('\n=== Signup Step 1: Aadhaar Verification ===');
    console.log('Name:', fullName);
    console.log('Aadhaar:', aadhaarNumber);

    if (!files || !files.aadhaarDocument) {
      return res.status(400).json({
        success: false,
        message: 'Please upload Aadhaar document'
      });
    }

    const aadhaarImage = files.aadhaarDocument[0].path;

    // ✅ FIX 1 applied: ocrService.verifyAadhaar instead of verifyAadhaar
    const verificationResult = await ocrService.verifyAadhaar(aadhaarImage, fullName, aadhaarNumber);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'Aadhaar verification failed'
      });
    }

    // ✅ Return document path so frontend can store and send it in completeSignup
    res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully',
      data: {
        fullName,
        aadhaarNumber,
        aadhaarDocument: aadhaarImage,
        aadhaarVerified: true,
        extractedName: verificationResult.extractedName
      }
    });
  } catch (error) {
    console.error('Signup Step 1 Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying Aadhaar: ' + error.message
    });
  }
};

// Step 2: Verify PAN
exports.signupStep2 = async (req, res) => {
  try {
    const { fullName, panNumber } = req.body;
    const files = req.files;

    console.log('\n=== Signup Step 2: PAN Verification ===');
    console.log('Name:', fullName);
    console.log('PAN:', panNumber);

    if (!files || !files.panDocument) {
      return res.status(400).json({
        success: false,
        message: 'Please upload PAN document'
      });
    }

    const panImage = files.panDocument[0].path;

    // ✅ FIX 1 applied: ocrService.verifyPan instead of verifyPan
    const verificationResult = await ocrService.verifyPan(panImage, fullName, panNumber);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'PAN verification failed'
      });
    }

    // ✅ Return document path so frontend can store and send it in completeSignup
    res.status(200).json({
      success: true,
      message: 'PAN verified successfully',
      data: {
        panNumber,
        panDocument: panImage,
        panVerified: true,
        extractedName: verificationResult.extractedName
      }
    });
  } catch (error) {
    console.error('Signup Step 2 Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PAN: ' + error.message
    });
  }
};

// Step 3: Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    console.log('\n=== Sending OTP ===');
    console.log('Mobile:', mobileNumber);

    if (!mobileNumber || mobileNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // ✅ FIX 2: otpService handles DB save + SMS + console log
    const otp = otpService.generateOTP();
    await otpService.sendOTP(mobileNumber, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP: ' + error.message
    });
  }
};

// Step 4: Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    console.log('\n=== Verifying OTP ===');
    console.log('Mobile:', mobileNumber);
    console.log('OTP:', otp);

    const result = await otpService.verifyOTP(mobileNumber, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Invalid OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: { mobileVerified: true }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP: ' + error.message
    });
  }
};

// Step 5: Complete Signup
exports.completeSignup = async (req, res) => {
  try {
    console.log('\n=== Completing Signup ===');
    console.log('Request Body:', req.body);

    const {
      fullName,
      aadhaarNumber,
      aadhaarDocument,   // ✅ FIX 3: server-side path from step 1 response
      panNumber,
      panDocument,       // ✅ FIX 3: server-side path from step 2 response
      mobileNumber,
      email,
      password,
      dateOfBirth,
      maritalStatus,
      occupation,
      gender,
      fatherName,
      motherName,
      address
    } = req.body;

    // Validate with clear messages before hitting Mongoose
    if (!aadhaarDocument) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar document path missing. Please redo Aadhaar verification.'
      });
    }
    if (!panDocument) {
      return res.status(400).json({
        success: false,
        message: 'PAN document path missing. Please redo PAN verification.'
      });
    }
    if (!maritalStatus) {
      return res.status(400).json({
        success: false,
        message: 'Marital status is required.'
      });
    }

    // Check for duplicate user
    const existingUser = await User.findOne({
      $or: [
        { aadhaarNumber },
        { mobileNumber },
        ...(email ? [{ email }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this Aadhaar, mobile, or email'
      });
    }

    // ✅ FIX 4: Pass plain password — User model pre('save') hook hashes it
    // DO NOT bcrypt.hash() here — double hashing breaks login forever
    const user = await User.create({
      fullName,
      aadhaarNumber,
      aadhaarDocument,
      aadhaarVerified: true,
      panNumber: panNumber || undefined,
      panDocument,
      panVerified: !!panNumber,
      mobileNumber,
      mobileVerified: true,
      email: email || undefined,
      password,
      dateOfBirth: dateOfBirth || undefined,
      maritalStatus,
      occupation: occupation || undefined,
      gender: gender || undefined,
      fatherName: fatherName || undefined,
      motherName: motherName || undefined,
      address: address || {},
      kycCompleted: true
    });

    const token = generateToken(user._id);
    console.log('✅ User created successfully:', user._id);

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        aadhaarNumber: user.aadhaarNumber,
        mobileNumber: user.mobileNumber,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Complete Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing signup: ' + error.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { aadhaarNumber, password } = req.body;

    console.log('\n=== Login Attempt ===');
    console.log('Aadhaar:', aadhaarNumber);

    const user = await User.findOne({ aadhaarNumber }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    console.log('✅ Login successful:', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        aadhaarNumber: user.aadhaarNumber,
        mobileNumber: user.mobileNumber,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role,
        kycCompleted: user.kycCompleted,
        requiresProfileCompletion: user.requiresProfileCompletion || false
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Error logging in: ' + error.message });
  }
};

// Officer Login
exports.officerLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    console.log('\n=== Officer Login Attempt ===');
    console.log('Employee ID:', employeeId);

    const user = await User.findOne({ employeeId }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!['revenue_officer', 'bank_manager', 'sub_registrar', 'admin'].includes(user.role)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    console.log('✅ Officer login successful:', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        employeeId: user.employeeId,
        department: user.department,
        role: user.role,
        bankId: user.bankId
      }
    });
  } catch (error) {
    console.error('Officer Login Error:', error);
    res.status(500).json({ success: false, message: 'Error logging in: ' + error.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        aadhaarNumber: user.aadhaarNumber,
        panNumber: user.panNumber,
        mobileNumber: user.mobileNumber,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        maritalStatus: user.maritalStatus,
        occupation: user.occupation,
        fatherName: user.fatherName,
        motherName: user.motherName,
        address: user.address,
        profilePhoto: user.profilePhoto,
        role: user.role,
        kycCompleted: user.kycCompleted,
        aadhaarVerified: user.aadhaarVerified,
        panVerified: user.panVerified,
        mobileVerified: user.mobileVerified,
        employeeId: user.employeeId,
        department: user.department,
        bankId: user.bankId
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile: ' + error.message });
  }
};

// Upload Profile Photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a photo' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    console.error('Upload Photo Error:', error);
    res.status(500).json({ success: false, message: 'Error uploading photo: ' + error.message });
  }
};

// Aliases for backward compatibility
exports.verifyAadhaar = exports.signupStep1;
exports.verifyPan = exports.signupStep2;
exports.sendOtp = exports.sendOTP;
exports.verifyOtp = exports.verifyOTP;
exports.getMe = exports.getProfile;
exports.updateProfilePhoto = exports.uploadProfilePhoto;