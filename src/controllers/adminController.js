// src/controllers/adminController.js
const asyncHandler = require('express-async-handler');
const { 
  User, Faccao, Cidade, Bairro, Seccional, TipoPrisao,
  AndamentoProcedimento, TipoPedidoCautelar, StatusPedidoCautelar,
  Ocorrencia, Vitima, Infrator, PedidoCautelar
} = require('../models');
const { Op } = require('sequelize');

// --- Nova Fábrica de CRUD Genérico ---
// Agora inclui a lógica de 'toggleStatus' e 'delete' seguro
const createCrudController = (model, modelName) => {
  
  // GET ALL - Busca todos (ativos e inativos) para a tela de gerenciamento
  const getAll = asyncHandler(async (req, res) => {
    const items = await model.findAll({ order: [['nome', 'ASC']] });
    res.status(200).json(items);
  })

  // CREATE - Cria um novo item
  const create = asyncHandler(async (req, res) => {
    
      const { nome, ...outrosCampos } = req.body;
      const newItem = await model.create({ nome, ...outrosCampos });
      res.status(201).json(newItem);
    
  });

  // UPDATE - Edita o nome de um item
  const update = asyncHandler(async (req, res) => {
    
      const { nome, ...outrosCampos } = req.body;
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: `${modelName} não encontrado(a).` });
      
      await item.update({ nome, ...outrosCampos });
      res.status(200).json(item);
  });

  // NOVO: TOGGLE STATUS - Ativa ou desativa um item
  const toggleStatus = asyncHandler(async (req, res) => {
 
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: `${modelName} não encontrado(a).` });
      
      item.ativo = !item.ativo; // Inverte o status
      await item.save();
      
      const action = item.ativo ? 'ativado(a)' : 'desativado(a)';
      res.status(200).json({ message: `${modelName} ${action} com sucesso.` });
    
  });

  // NOVO: DELETE SEGURO - Deleta apenas se não estiver em uso
  const deleteItem = asyncHandler(async (req, res) => {
   
      const item = await model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: `${modelName} não encontrado(a).` });

      let inUseCount = 0;
      // Verificação de uso baseada no nome do modelo
      switch(model.name) {
        case 'Faccao':
          inUseCount = await Ocorrencia.count({ where: { faccaoArea: item.nome } }) ||
                       await Vitima.count({ where: { faccao: item.nome } }) ||
                       await Infrator.count({ where: { faccao: item.nome } });
          break;
        case 'Cidade':
          inUseCount = await Ocorrencia.count({ where: { cidadeId: item.id } }) || 
                       await User.count({ where: { cidadeId: item.id } });
          break;
        case 'TipoPrisao':
          inUseCount = await Infrator.count({ where: { tipoPrisao: item.nome } });
          break;
        case 'AndamentoProcedimento':
          inUseCount = await Ocorrencia.count({ where: { andamentoProcedimento: item.nome } });
          break;
        case 'TipoPedidoCautelar':
          inUseCount = await PedidoCautelar.count({ where: { tipo: item.nome } });
          break;
        case 'StatusPedidoCautelar':
          inUseCount = await PedidoCautelar.count({ where: { andamento: item.nome } });
          break;
        case 'Bairro':
           inUseCount = await Ocorrencia.count({ where: { bairro: item.nome } });
           break;
      }

      if (inUseCount > 0) {
        return res.status(409).json({ message: `Este item está em uso e não pode ser excluído. Desative-o se não quiser mais usá-lo em novos cadastros.` });
      }

      await item.destroy();
      res.status(200).json({ message: `${modelName} excluído(a) com sucesso.` });
    
  });

  return { getAll, create, update, toggleStatus, delete: deleteItem };
};

// --- Controller Específico para Usuários ---
const usersController = {
  // GET /api/admin/users
  getAll: asyncHandler(async (req, res) => {
    const users = await User.findAll({ 
      where: { isAdmin: false },
      attributes: { exclude: ['password'] },
      include: [Cidade, Seccional],
      order: [['id', 'ASC']] 
    });
    res.status(200).json(users);
  }),
  // POST /api/admin/users
  create: asyncHandler(async (req, res) => {
    try {
      const { email, password, seccionalId, cidadeId } = req.body;
      const newUser = await User.create({ email, password, seccionalId, cidadeId });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: `Erro ao criar usuário`, error: error.message });
    }
  }),
  // DELETE /api/admin/users/:id
  delete: asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: `Usuário não encontrado(a).` });
    await user.destroy();
    res.status(200).json({ message: `Usuário excluído(a) com sucesso.` });
  })
};

// --- Controller Específico para Bairros (com busca) ---
const bairrosController = {
  // 1. Primeiro, importe todos os métodos genéricos (create, update, delete, toggleStatus e o getAll genérico).
  ...createCrudController(Bairro, 'Bairro'),

  // 2. Agora, sobrescreva APENAS o método 'getAll' com a sua implementação específica que contém a lógica de filtro.
  getAll: asyncHandler(async (req, res) => {
    
      const { nome, seccionalId, cidadeId } = req.query;

      // LOG PARA DEPURAR: Mostra os filtros recebidos no terminal do backend
      console.log("LOG [Backend Admin]: Filtros de bairros recebidos:", { nome, seccionalId, cidadeId });
      
      const queryOptions = {
        where: {},
        // Linha corrigida:
        include: [{ model: Cidade, as: 'Cidade', attributes: ['nome'], required: true }],
        order: [['nome', 'ASC']]
      };

      if (nome) {
        queryOptions.where.nome = { [Op.like]: `%${nome}%` };
      }

      if (cidadeId) {
        queryOptions.where.cidadeId = cidadeId;
      } else if (seccionalId) {
        // Esta lógica aninha a condição 'where' dentro do 'include'
        queryOptions.include[0].where = { seccionalId: seccionalId };
      }
      
      const items = await Bairro.findAll(queryOptions);
      res.status(200).json(items);
    
  })
};

// --- Exportações ---
exports.usersController = usersController;
exports.bairrosController = bairrosController;
exports.faccoesController = createCrudController(Faccao, 'Facção');
exports.cidadesController = createCrudController(Cidade, 'Cidade');
exports.tiposPrisaoController = createCrudController(TipoPrisao, 'Tipo de Prisão');
exports.andamentosController = createCrudController(AndamentoProcedimento, 'Andamento');
exports.tiposPedidoController = createCrudController(TipoPedidoCautelar, 'Tipo de Pedido');
exports.statusPedidoController = createCrudController(StatusPedidoCautelar, 'Status de Pedido');