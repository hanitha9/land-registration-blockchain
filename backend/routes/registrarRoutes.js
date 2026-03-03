const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const registrarController = require('../controllers/registrarController');

// Sub-registrar routes
router.get('/transfers/pending', protect, checkRole('sub_registrar'), registrarController.getPendingTransfers);
router.get('/transfers/history', protect, checkRole('sub_registrar'), registrarController.getTransferHistory);
router.get('/transfers/:transferId/verify', protect, checkRole('sub_registrar'), registrarController.verifyTransfer);
router.post('/transfers/approve', protect, checkRole('sub_registrar'), registrarController.approveTransfer);
router.post('/transfers/reject', protect, checkRole('sub_registrar'), registrarController.rejectTransfer);

module.exports = router;