const express = require('express');
const router = express.Router();
const upload = require('../utils/uploadMiddleware');
const { protect } = require('../utils/authMiddleware');
const authController = require('../controllers/authController');

// Signup routes
router.post('/signup/step1', upload.fields([
  { name: 'aadhaarDocument', maxCount: 1 }
]), authController.signupStep1);

router.post('/signup/step2', upload.fields([
  { name: 'panDocument', maxCount: 1 }
]), authController.signupStep2);

router.post('/signup/send-otp', authController.sendOTP);
router.post('/signup/verify-otp', authController.verifyOTP);
router.post('/signup/complete', authController.completeSignup);

// Login
router.post('/login', authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.get('/me', protect, authController.getProfile);
router.post('/profile/photo', protect, upload.single('profilePhoto'), authController.uploadProfilePhoto);
router.post('/update-profile-photo', protect, upload.single('profilePhoto'), authController.uploadProfilePhoto);

module.exports = router;
