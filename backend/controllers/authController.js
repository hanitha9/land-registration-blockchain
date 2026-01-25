const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyAadhaar, verifyPan } = require('../utils/ocrService');
const { generateOTP, sendOTP } = require('../utils/otpService');

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
    
    console.log('\n=== Signup Step 1: Aadhaar Verification ===');
    console.log('Name:', fullName);
    console.log('Aadhaar:', aadhaarNumber);

    if (!req.files || !req.files.aadhaarDocument) {
      return res.status(400).json({
        success: false,
        message: 'Please upload Aadhaar document'
      });
    }

    const aadhaarImage = req.files.aadhaarDocument[0].path;
    
    // Verify Aadhaar using OCR
    const verificationResult = await verifyAadhaar(aadhaarImage, fullName, aadhaarNumber);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'Aadhaar verification failed'
      });
    }

    // Store in session/temp (you might want to use Redis in production)
    res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully',
      data: {
        fullName,
        aadhaarNumber,
        aadhaarDocument: aadhaarImage,
        aadhaarVerified: true
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
    
    console.log('\n=== Signup Step 2: PAN Verification ===');
    console.log('Name:', fullName);
    console.log('PAN:', panNumber);

    if (!req.files || !req.files.panDocument) {
      return res.status(400).json({
        success: false,
        message: 'Please upload PAN document'
      });
    }

    const panImage = req.files.panDocument[0].path;
    
    // Verify PAN using OCR
    const verificationResult = await verifyPan(panImage, fullName, panNumber);
    
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'PAN verification failed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'PAN verified successfully',
      data: {
        panNumber,
        panDocument: panImage,
        panVerified: true
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

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await OTP.findOneAndUpdate(
      { mobileNumber },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send OTP (in dev mode, just log it)
    await sendOTP(mobileNumber, otp);
    
    console.log(`🔐 OTP for ${mobileNumber}: ${otp}`);

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

    const otpRecord = await OTP.findOne({ mobileNumber });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new one.'
      });
    }

    // Check if OTP is expired (5 minutes)
    const otpAge = Date.now() - otpRecord.createdAt.getTime();
    if (otpAge > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Delete used OTP
    await OTP.deleteOne({ mobileNumber });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        mobileVerified: true
      }
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
      panNumber,
      mobileNumber,
      email,
      password,
      dateOfBirth,
      gender,
      fatherName,
      motherName,
      address
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { aadhaarNumber },
        { mobileNumber },
        { email: email || undefined }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this Aadhaar, mobile, or email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      aadhaarNumber,
      panNumber: panNumber || undefined,
      mobileNumber,
      email: email || undefined,
      password: hashedPassword,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      fatherName: fatherName || undefined,
      motherName: motherName || undefined,
      address: address || {},
      kycStatus: {
        aadhaar: true,
        pan: !!panNumber,
        mobile: true
      }
    });

    // Generate token
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
        email: user.email
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

    // Find user
    const user = await User.findOne({ aadhaarNumber }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
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
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in: ' + error.message
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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
        fatherName: user.fatherName,
        motherName: user.motherName,
        address: user.address,
        profilePhoto: user.profilePhoto,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile: ' + error.message
    });
  }
};

// Upload Profile Photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error uploading photo: ' + error.message
    });
  }
};

// Aliases for backward compatibility
exports.verifyAadhaar = exports.signupStep1;
exports.verifyPan = exports.signupStep2;
exports.sendOtp = exports.sendOTP;
exports.verifyOtp = exports.verifyOTP;
exports.getMe = exports.getProfile;
exports.updateProfilePhoto = exports.uploadProfilePhoto;
