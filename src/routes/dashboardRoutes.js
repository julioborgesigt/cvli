// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Rota para buscar os dados resumidos do dashboard do usuário
router.get('/summary', protect, dashboardController.getDashboardSummary);

module.exports = router;