const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const revenueController = require('../controllers/revenueController');

// Revenue officer routes
router.post('/lands', protect, checkRole('revenue_officer', 'admin'), revenueController.createLandRecord);
router.get('/lands', protect, checkRole('revenue_officer', 'admin'), revenueController.getAllLands);
router.put('/lands/:landId', protect, checkRole('revenue_officer', 'admin'), revenueController.updateLand);
router.post('/lands/mark-disputed', protect, checkRole('revenue_officer', 'admin'), revenueController.markLandDisputed);
router.post('/lands/resolve-dispute', protect, checkRole('revenue_officer', 'admin'), revenueController.resolveLandDispute);
router.get('/statistics', protect, checkRole('revenue_officer', 'admin'), revenueController.getStatistics);

module.exports = router;
// Registration approval
router.get('/registrations/pending', protect, checkRole('revenue_officer', 'admin'), revenueController.getPendingRegistrations);
router.post('/registrations/approve', protect, checkRole('revenue_officer', 'admin'), revenueController.approveLandRegistration);
router.post('/registrations/reject', protect, checkRole('revenue_officer', 'admin'), revenueController.rejectLandRegistration);
