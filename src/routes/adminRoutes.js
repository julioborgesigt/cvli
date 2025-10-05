// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  usersController,
  faccoesController,
  cidadesController,
  bairrosController,
  tiposPrisaoController,
  andamentosController,
  tiposPedidoController,
  statusPedidoController
} = require('../controllers/adminController');

// Função auxiliar para criar rotas CRUD
const createCrudRoutes = (path, controller) => {
  router.route(path)
    .get(protect, adminOnly, controller.getAll)
    .post(protect, adminOnly, controller.create);

  router.route(`${path}/:id`)
    .put(protect, adminOnly, controller.update)
    // NOVO: Adiciona a rota PATCH para ativar/desativar
    .patch(protect, adminOnly, controller.toggleStatus)
    .delete(protect, adminOnly, controller.delete);
};

// Rotas específicas para usuários (sem alteração, pois não têm status 'ativo')
router.route('/users')
  .get(protect, adminOnly, usersController.getAll)
  .post(protect, adminOnly, usersController.create);
router.route('/users/:id')
  .delete(protect, adminOnly, usersController.delete);

// Rotas de Admin para Bairros
router.route('/bairros')
  .get(protect, adminOnly, bairrosController.getAll)
  .post(protect, adminOnly, bairrosController.create);

router.route('/bairros/:id')
  .put(protect, adminOnly, bairrosController.update)
  // NOVO: Adiciona a rota PATCH para ativar/desativar bairros
  .patch(protect, adminOnly, bairrosController.toggleStatus)
  .delete(protect, adminOnly, bairrosController.delete);

// Rotas criadas com a função auxiliar
createCrudRoutes('/faccoes', faccoesController);
createCrudRoutes('/cidades', cidadesController);
createCrudRoutes('/tipos-prisao', tiposPrisaoController);
createCrudRoutes('/andamentos', andamentosController);
createCrudRoutes('/tipos-pedido', tiposPedidoController);
createCrudRoutes('/status-pedido', statusPedidoController);

module.exports = router;