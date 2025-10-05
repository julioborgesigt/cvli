// src/controllers/bairroController.js
const { Bairro, Ocorrencia } = require('../models');

// GET /api/bairros - Retorna apenas os bairros da cidade do usuário logado
// GET /api/bairros - Retorna apenas os bairros da cidade do usuário logado
exports.getBairros = async (req, res, next) => {
  try {
    const bairros = await Bairro.findAll({ where: { cidadeId: req.user.cidadeId } });
    res.status(200).json(bairros);
  } catch (error) {
    next(error);
  }
};

// POST /api/bairros - Cria um bairro associado à cidade do usuário
// dentro de src/controllers/bairroController.js

exports.createBairro = async (req, res, next) => {
  try {
    const { nome } = req.body;
    if (!nome || !nome.trim()) {
      res.status(400);
      throw new Error('O nome do bairro é obrigatório.');
    }
    const novoBairro = await Bairro.create({ nome, cidadeId: req.user.cidadeId });
    res.status(201).json(novoBairro);
  } catch (error) {
    next(error);
  }
};

exports.updateBairro = async (req, res, next) => {
  try {
    const { nome } = req.body;
    const bairro = await Bairro.findOne({ where: { id: req.params.id, cidadeId: req.user.cidadeId } });

    if (!bairro) {
      res.status(404);
      throw new Error('Bairro não encontrado ou não pertence à sua cidade.');
    }

    bairro.nome = nome;
    await bairro.save();
    res.status(200).json(bairro);
  } catch (error) {
    next(error);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const bairro = await Bairro.findOne({ where: { id: req.params.id, cidadeId: req.user.cidadeId } });

    if (!bairro) {
      res.status(404);
      throw new Error('Bairro não encontrado ou não pertence à sua cidade.');
    }

    bairro.ativo = !bairro.ativo;
    await bairro.save();
    res.status(200).json(bairro);
  } catch (error) {
    next(error);
  }
};


// DELETE /api/bairros/:id - Deleta um bairro da cidade do usuário
exports.deleteBairro = async (req, res, next) => {
  try {
    const bairro = await Bairro.findOne({ where: { id: req.params.id, cidadeId: req.user.cidadeId } });
    if (!bairro) {
      res.status(404);
      throw new Error('Bairro não encontrado ou não pertence à sua cidade.');
    }

    // Verificação de uso em Ocorrências
    const inUse = await Ocorrencia.count({ where: { bairro: bairro.nome, cidadeId: req.user.cidadeId } });
    if (inUse > 0) {
      res.status(409); // 409 Conflict
      throw new Error('Este bairro está em uso e não pode ser excluído.');
    }

    await bairro.destroy();
    res.status(200).json({ message: 'Bairro excluído com sucesso.' });
  } catch (error) {
    next(error);
  }
};