// src/controllers/pedidoCautelarController.js
const { PedidoCautelar, Ocorrencia } = require('../models');
const { Op } = require('sequelize');

// @desc    Listar todos os pedidos cautelares da cidade do usuário
// @route   GET /api/pedidos
// @access  Privado
exports.listPedidos = async (req, res) => {
  try {
    // 1. RECEBE O NOVO PARÂMETRO DE BUSCA
    const { tipo, andamento, searchQuery } = req.query;

    const ocorrenciaWhereClause = {};
    if (!req.user.isAdmin) {
      ocorrenciaWhereClause.cidadeId = req.user.cidadeId;
    }

    const pedidoWhereClause = {};
    if (tipo) {
      pedidoWhereClause.tipo = tipo;
    }
    if (andamento) {
      pedidoWhereClause.andamento = andamento;
    }

    // 2. ADICIONA A LÓGICA DE BUSCA 'OU'
    if (searchQuery) {
      pedidoWhereClause[Op.or] = [
        // Busca no número do processo do próprio Pedido Cautelar
        { numeroProcesso: { [Op.like]: `%${searchQuery}%` } },
        // Busca no número do inquérito da Ocorrência associada
        { '$Ocorrencium.numeroInquerito$': { [Op.like]: `%${searchQuery}%` } }
      ];
    }

    const pedidos = await PedidoCautelar.findAll({
      where: pedidoWhereClause,
      include: [{
        model: Ocorrencia,
        attributes: ['numeroInquerito', 'cidadeId', 'numeroProcessoPrincipal'],
        where: ocorrenciaWhereClause,
        required: true,
      }],
      order: [['id', 'DESC']]
    });

    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos cautelares.', error: error.message });
  }
};

// @desc    Atualizar um pedido cautelar
// @route   PUT /api/pedidos/:id
// @access  Privado
exports.updatePedido = async (req, res) => {
  try {
    const { andamento, numeroProcesso, senha } = req.body;
    const pedidoId = req.params.id;

    // Primeiro, encontra o pedido para garantir que ele existe
    const pedido = await PedidoCautelar.findByPk(pedidoId);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido Cautelar não encontrado.' });
    }
    
    // Se não for admin, verifica se o pedido pertence a uma ocorrência da cidade do usuário
    if (!req.user.isAdmin) {
      const ocorrencia = await Ocorrencia.findByPk(pedido.ocorrenciaId);
      if (ocorrencia.cidadeId !== req.user.cidadeId) {
        return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para editar este pedido.' });
      }
    }

    // Atualiza o pedido
    pedido.andamento = andamento;
    pedido.numeroProcesso = numeroProcesso;
    pedido.senha = senha;
    await pedido.save();

    res.status(200).json({ message: 'Pedido atualizado com sucesso!', pedido });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar pedido cautelar.', error: error.message });
  }
};

// @desc    Excluir um pedido cautelar
// @route   DELETE /api/pedidos/:id
// @access  Privado
exports.deletePedido = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const pedido = await PedidoCautelar.findByPk(pedidoId);
    if (!pedido) {
      return res.status(404).json({ message: 'Pedido Cautelar não encontrado.' });
    }
    
    // Se não for admin, verifica a permissão
    if (!req.user.isAdmin) {
      const ocorrencia = await Ocorrencia.findByPk(pedido.ocorrenciaId);
      if (ocorrencia.cidadeId !== req.user.cidadeId) {
        return res.status(403).json({ message: 'Acesso negado.' });
      }
    }

    await pedido.destroy();
    res.status(200).json({ message: 'Pedido Cautelar excluído com sucesso.' });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir pedido cautelar.', error: error.message });
  }
};