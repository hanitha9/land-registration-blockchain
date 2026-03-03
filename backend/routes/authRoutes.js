// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../utils/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Signup routes with proper middleware
router.post('/signup/step1', upload.fields([
  { name: 'aadhaarDocument', maxCount: 1 }
]), (req, res, next) => {
  console.log('Step 1 Headers:', req.headers);
  console.log('Step 1 Body:', req.body);
  console.log('Step 1 Files:', req.files);
  next();
}, authController.signupStep1);

router.post('/signup/step2', upload.fields([
  { name: 'panDocument', maxCount: 1 }
]), (req, res, next) => {
  console.log('Step 2 Headers:', req.headers);
  console.log('Step 2 Body:', req.body);
  console.log('Step 2 Files:', req.files);
  next();
}, authController.signupStep2);

router.post('/signup/send-otp', (req, res, next) => {
  console.log('Send OTP Headers:', req.headers);
  console.log('Send OTP Body:', req.body);
  next();
}, authController.sendOTP);

router.post('/signup/verify-otp', (req, res, next) => {
  console.log('Verify OTP Headers:', req.headers);
  console.log('Verify OTP Body:', req.body);
  next();
}, authController.verifyOTP);

router.post('/signup/complete', (req, res, next) => {
  console.log('Complete Signup Headers:', req.headers);
  console.log('Complete Signup Body:', req.body);
  next();
}, authController.completeSignup);

// Login routes
router.post('/login', (req, res, next) => {
  console.log('Login Headers:', req.headers);
  console.log('Login Body:', req.body);
  next();
}, authController.login);

router.post('/officer/login', (req, res, next) => {
  console.log('Officer Login Headers:', req.headers);
  console.log('Officer Login Body:', req.body);
  next();
}, authController.officerLogin);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.get('/me', protect, authController.getProfile);
router.post('/profile/photo', protect, upload.single('profilePhoto'), authController.uploadProfilePhoto);
router.post('/update-profile-photo', protect, upload.single('profilePhoto'), authController.uploadProfilePhoto);

module.exports = router;