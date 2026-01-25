const express = require('express');
const router = express.Router();
const { protect } = require('../utils/authMiddleware');
const {
  getPendingRegistrations,
  verifyLandRegistration,
  registerOnBlockchain,
  getAllRegistrations,
  updateMeeting
} = require('../controllers/registrarController');

// All routes require authentication
// In production, add role-based access control (isRegistrar middleware)
router.use(protect);

router.get('/pending', getPendingRegistrations);
router.get('/all', getAllRegistrations);
router.post('/verify/:id', verifyLandRegistration);
router.post('/register-blockchain/:id', registerOnBlockchain);
router.put('/meeting/:id', updateMeeting);

module.exports = router;
