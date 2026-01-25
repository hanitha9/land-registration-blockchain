'use strict';

const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

// Register new land
router.post('/register', landController.registerLand);

// Get specific land
router.get('/:landId', landController.getLand);

// Get all lands
router.get('/', landController.getAllLands);

// Transfer land
router.put('/:landId/transfer', landController.transferLand);

// Delete land
router.delete('/:landId', landController.deleteLand);

module.exports = router;

