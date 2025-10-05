// src/routes/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/resolvability', protect, adminOnly, statisticsController.getResolvabilityStats);
router.get('/monthly', protect, adminOnly, statisticsController.getMonthlyStats);
router.get('/arrests-by-city', protect, adminOnly, statisticsController.getArrestStatsByCity);
router.get('/judicial-orders-by-city', protect, adminOnly, statisticsController.getOrderStatsByCity);
router.get('/faction-involvement', protect, adminOnly, statisticsController.getFactionStats);
router.get('/arrest-types', protect, adminOnly, statisticsController.getArrestTypesStats);


module.exports = router;