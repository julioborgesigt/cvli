// src/routes/pedidoCautelarRoutes.js
const express = require('express');
const router = express.Router();
const pedidoCautelarController = require('../controllers/pedidoCautelarController');
const { protect } = require('../middleware/authMiddleware'); // Adicionamos 'protect' para todas as rotas

router.route('/')
  .get(protect, pedidoCautelarController.listPedidos);

router.route('/:id')
  .put(protect, pedidoCautelarController.updatePedido)
  .delete(protect, pedidoCautelarController.deletePedido);

module.exports = router;