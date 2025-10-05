// src/routes/bairroRoutes.js
const express = require('express');
const router = express.Router();
const bairroController = require('../controllers/bairroController');
const { protect } = require('../middleware/authMiddleware'); // Apenas 'protect', sem 'adminOnly'

router.route('/')
  .get(protect, bairroController.getBairros)
  .post(protect, bairroController.createBairro);

// ROTA CORRIGIDA: Adicionadas as rotas PUT e PATCH para o usuário comum
router.route('/:id')
  .put(protect, bairroController.updateBairro)      // <-- Rota para editar
  .patch(protect, bairroController.toggleStatus)    // <-- Rota para ativar/desativar
  .delete(protect, bairroController.deleteBairro);  // <-- Rota para deletar

module.exports = router;