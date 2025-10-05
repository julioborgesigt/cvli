// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/complete-profile', protect, authController.completeProfile);



module.exports = router;