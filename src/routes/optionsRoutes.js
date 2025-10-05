// src/routes/optionsRoutes.js
const express = require('express');
const router = express.Router();
const optionsController = require('../controllers/optionsController');
const { protect } = require('../middleware/authMiddleware');

// Esta rota só precisa que o usuário esteja logado (protect), não precisa ser admin (adminOnly)
router.get('/form-options', protect, optionsController.getFormOptions);

module.exports = router;