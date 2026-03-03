const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

// Transaction routes
router.get('/', protect, transactionController.getTransactionHistory);
router.get('/:transactionId', protect, transactionController.getTransaction);
router.get('/export', protect, transactionController.exportReport);

module.exports = router;