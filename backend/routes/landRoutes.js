// backend/routes/landRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const landController = require('../controllers/landController');
const upload = require('../utils/uploadMiddleware');

// ── Must come BEFORE /:landId routes ──────────────────────────────────────────

// Land registration (multipart)
router.post('/request-registration', protect, upload.fields([
  { name: 'landDocument', maxCount: 1 },
  { name: 'landPhotos', maxCount: 10 }
]), landController.requestLandRegistration);

// Citizen actions — flat routes matching frontend landApi.js
router.post('/apply-loan',    protect, landController.applyLoan);
router.post('/initiate-sale', protect, landController.initiateSale);

// Get my lands
router.get('/my-lands', protect, landController.getMyLands);

// ── /:landId routes AFTER flat routes ─────────────────────────────────────────
router.get('/:landId',         protect, landController.getLand);
router.get('/:landId/blockchain', protect, landController.getLandById);
router.get('/:landId/blockchain', protect, landController.getLandById);
router.get('/:landId/history', protect, landController.getLandHistory);

module.exports = router;