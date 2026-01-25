const express = require('express');
const router = express.Router();
const upload = require('../utils/uploadMiddleware');
const { protect } = require('../utils/authMiddleware');
const landRegistrationController = require('../controllers/landRegistrationController');

// All routes are protected
router.use(protect);

// Start registration
router.post('/start', landRegistrationController.startRegistration);

// Submit details with file uploads
router.post('/submit-details', upload.fields([
  { name: 'ownerLivePhoto', maxCount: 1 },
  { name: 'landDocument', maxCount: 1 },
  { name: 'previousOwnerDocument', maxCount: 1 },
  { name: 'ownershipProof', maxCount: 1 },
  { name: 'surveyMap', maxCount: 1 },
  { name: 'landPhotos', maxCount: 10 }
]), landRegistrationController.submitDetails);

// Get user's registrations
router.get('/my-registrations', landRegistrationController.getMyRegistrations);

// Get single registration
router.get('/:id', landRegistrationController.getRegistration);

// Get payment details
router.get('/:id/payment', landRegistrationController.getPaymentDetails);

// Make payment
router.post('/:id/payment', upload.single('paymentProof'), landRegistrationController.makePayment);

module.exports = router;
