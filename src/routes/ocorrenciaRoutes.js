// src/routes/ocorrenciaRoutes.js
const express = require('express');
const router = express.Router();
const ocorrenciaController = require('../controllers/ocorrenciaController');
const { protect } = require('../middleware/authMiddleware');

// NOVA ROTA PARA VERIFICAÇÃO DE UNICIDADE
router.post('/check-uniqueness', protect, ocorrenciaController.checkNumeroInquerito);



router.post('/', protect, ocorrenciaController.createOcorrencia);
router.get('/', protect, ocorrenciaController.getOcorrencias); 
router.get('/:id', protect, ocorrenciaController.getOcorrenciaById);

router.put('/:id', protect, ocorrenciaController.updateOcorrencia);
router.delete('/:id', protect, ocorrenciaController.deleteOcorrencia);

module.exports = router;