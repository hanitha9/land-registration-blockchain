// backend/routes/bankRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const bankController = require('../controllers/bankController');

// Loan queries
router.get('/loans/pending',  protect, checkRole('bank_manager'), bankController.getPendingLoans);
router.get('/loans/active',   protect, checkRole('bank_manager'), bankController.getActiveMortgages);
router.get('/loans/cleared',  protect, checkRole('bank_manager'), bankController.getClearedLoans);
router.get('/loans/rejected', protect, checkRole('bank_manager'), bankController.getRejectedLoans);

// Land verify
router.get('/lands/:landId/verify', protect, checkRole('bank_manager'), bankController.verifyLandOwnership);

// Loan actions (keep :param style to match existing frontend calls)
router.post('/loans/approve', protect, checkRole('bank_manager'), bankController.approveLoan);
router.post('/loans/reject',  protect, checkRole('bank_manager'), bankController.rejectLoan);
router.post('/loans/clear',   protect, checkRole('bank_manager'), bankController.clearLoan);

module.exports = router;