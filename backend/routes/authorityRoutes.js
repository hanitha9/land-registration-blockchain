const express = require('express');
const router = express.Router();
const authorityController = require('../controllers/authorityController');
const { protect, authorityOnly } = require('../utils/authMiddleware');

// Public route - Authority login
router.post('/login', authorityController.authorityLogin);

// Protected routes - Only for authenticated authority
router.use(protect);
router.use(authorityOnly);

// Dashboard
router.get('/dashboard/stats', authorityController.getDashboardStats);

// Registrations
router.get('/registrations', authorityController.getAllRegistrations);
router.get('/registrations/pending', authorityController.getPendingRegistrations);
router.get('/registrations/:id', authorityController.getRegistrationDetails);

// Meeting management
router.post('/registrations/:id/schedule-meeting', authorityController.scheduleMeeting);
router.post('/registrations/:id/complete-meeting', authorityController.completeMeeting);

// Verification
router.post('/registrations/:id/verify-documents', authorityController.verifyDocuments);
router.post('/registrations/:id/generate-land-id', authorityController.generateLandIdAndApprove);
router.post('/registrations/:id/reject', authorityController.rejectRegistration);

module.exports = router;
