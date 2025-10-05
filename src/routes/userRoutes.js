// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // <-- Importamos nosso segurança

// Aplicamos o middleware 'protect' a esta rota.
// A requisição só chegará em 'getUserProfile' se o token for válido.
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);

module.exports = router;