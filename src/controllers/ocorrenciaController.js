const { Ocorrencia, Vitima, Infrator, PedidoCautelar, Cidade, sequelize } = require('../models');
const { Op } = require('sequelize');



// NOVA FUNÇÃO PARA VERIFICAR UNICIDADE DO Nº DO INQUÉRITO
exports.checkNumeroInquerito = async (req, res) => {
  try {
    const { numeroInquerito, ocorrenciaId } = req.body; // Pega o número e o ID da ocorrência (se estiver em modo de edição)

    // Validação básica de formato no backend
    const formatRegex = /^\d{3}-\d{5}\/\d{4}$/;
    if (!formatRegex.test(numeroInquerito)) {
      return res.status(200).json({ isUnique: false, message: 'Formato inválido.' });
    }

    const whereClause = { numeroInquerito };

    // Se estivermos editando, precisamos ignorar a própria ocorrência na busca por duplicatas
    if (ocorrenciaId) {
      whereClause.id = { [Op.ne]: ocorrenciaId }; // [Op.ne] significa "not equal" (diferente de)
    }

    const existing = await Ocorrencia.findOne({ where: whereClause });

    if (existing) {
      res.status(200).json({ isUnique: false, message: 'Este número de inquérito já está em uso.' });
    } else {
      res.status(200).json({ isUnique: true, message: 'Número de inquérito válido.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar o número do inquérito.' });
  }
};






// @desc    Cadastrar uma nova ocorrência
// @route   POST /api/ocorrencias
// @access  Privado
exports.createOcorrencia = async (req, res) => {
  // ... (Esta função não precisa de alterações, pois já usa a cidade do usuário corretamente)
  const t = await sequelize.transaction();
  try {
    const {
      dataCrime, bairro, faccaoArea, numeroInquerito, crimeElucidado,
      andamentoProcedimento, numeroProcessoPrincipal, vitimas, infratores, pedidosCautelares,
      cidadeId: adminCidadeId
    } = req.body;

    let cidadeId;
    if (req.user.isAdmin) {
      cidadeId = adminCidadeId;
      if (!cidadeId) {
        return res.status(400).json({ message: 'Para administradores, a cidade é um campo obrigatório.' });
      }
    } else {
      cidadeId = req.user.cidadeId;
      if (!cidadeId) {
        return res.status(400).json({ message: 'Usuário precisa ter uma cidade definida em seu perfil.' });
      }
    }

    const novaOcorrencia = await Ocorrencia.create({
      dataCrime, bairro, faccaoArea, numeroInquerito,
      quantidadeVitimas: vitimas.length,
      crimeElucidado,
      quantidadeInfratores: infratores ? infratores.length : 0,
      andamentoProcedimento,
      numeroProcessoPrincipal,
      userId: req.user.id, // Ainda salvamos quem criou a ocorrência
      cidadeId 
    }, { transaction: t });

    for (const vitima of vitimas) {
      await Vitima.create({ ...vitima, ocorrenciaId: novaOcorrencia.id }, { transaction: t });
    }
    if (crimeElucidado && infratores && infratores.length > 0) {
      for (const infrator of infratores) {
        await Infrator.create({ ...infrator, ocorrenciaId: novaOcorrencia.id }, { transaction: t });
      }
    }
    
    if (pedidosCautelares && pedidosCautelares.length > 0) {
      for (const pedido of pedidosCautelares) {
        await PedidoCautelar.create({
          ...pedido, 
          ocorrenciaId: novaOcorrencia.id
        }, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json({ message: 'Ocorrência cadastrada com sucesso!', ocorrenciaId: novaOcorrencia.id });

  } catch (error) {
    await t.rollback();
    // CORREÇÃO: Captura de erros de validação
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Erro ao cadastrar ocorrência.', error: error.message });
  }
};


// @desc    Listar ocorrências
exports.getOcorrencias = async (req, res) => {
  try {
    const { 
      seccionalId, cidadeId, numeroInquerito, year, sortBy, nomePessoa,
      page = 1, 
      limit = 15
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const queryOptions = {
      where: {},
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
      // CORREÇÃO: A ordenação volta para a consulta do banco de dados
      order: sortBy === 'numero' 
        ? [['numeroInquerito', 'ASC']] 
        : [['dataCrime', 'DESC']],
      include: [
        { model: Vitima, as: 'Vitimas', attributes: ['nome'], separate: true, limit: 1, order: [['id', 'ASC']] },
        { model: Infrator, as: 'Infrators', attributes: ['nome'], separate: true, limit: 1, order: [['id', 'ASC']] }
      ]
    };

    if (nomePessoa) {
      const vitimas = await Vitima.findAll({ where: { nome: { [Op.like]: `%${nomePessoa}%` } }, attributes: ['ocorrenciaId'] });
      const idsFromVitimas = vitimas.map(v => v.ocorrenciaId);
      const infratores = await Infrator.findAll({ where: { nome: { [Op.like]: `%${nomePessoa}%` } }, attributes: ['ocorrenciaId'] });
      const idsFromInfratores = infratores.map(i => i.ocorrenciaId);
      const ocorrenciaIds = [...new Set([...idsFromVitimas, ...idsFromInfratores])];

      if (ocorrenciaIds.length === 0) {
        return res.status(200).json({ data: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1 } });
      }
      queryOptions.where.id = { [Op.in]: ocorrenciaIds };
    }

    if (!req.user.isAdmin) {
      queryOptions.where.cidadeId = req.user.cidadeId;
      if (numeroInquerito) queryOptions.where.numeroInquerito = { [Op.like]: `%${numeroInquerito}%` };
      if (year) queryOptions.where.dataCrime = sequelize.where(sequelize.fn('YEAR', sequelize.col('Ocorrencia.dataCrime')), year);
    } else {
      if (numeroInquerito) queryOptions.where.numeroInquerito = { [Op.like]: `%${numeroInquerito}%` };
      if (cidadeId) queryOptions.where.cidadeId = cidadeId;
      if (year) queryOptions.where.dataCrime = sequelize.where(sequelize.fn('YEAR', sequelize.col('Ocorrencia.dataCrime')), year);
      if (seccionalId) {
        queryOptions.include.push({
          model: Cidade,
          attributes: [],
          where: { seccionalId: seccionalId },
          required: true
        });
      }
    }

    // 2. USA 'findAndCountAll' PARA BUSCAR UMA PÁGINA E CONTAR O TOTAL
    const { count, rows } = await Ocorrencia.findAndCountAll(queryOptions);

  

    // 3. RETORNA UM OBJETO COM OS DADOS E A INFORMAÇÃO DE PAGINAÇÃO
   res.status(200).json({
      data: rows, // Retorna 'rows' diretamente, já ordenados pelo banco
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      }
    });

  } catch (error) {
    console.error("ERRO DETALHADO EM getOcorrencias:", error);
    res.status(500).json({ message: 'Erro ao buscar ocorrências.', error: error.message });
  }
};


// @desc    Obter detalhes de uma ocorrência específica
exports.getOcorrenciaById = async (req, res) => {
  try {
    const whereClause = { id: req.params.id };

    // CORREÇÃO: Garante que o usuário só possa ver ocorrências da sua própria cidade
    if (!req.user.isAdmin) {
      whereClause.cidadeId = req.user.cidadeId;
    }

    const ocorrencia = await Ocorrencia.findOne({
      where: whereClause,
      include: [
        { model: Vitima, as: 'Vitimas' }, 
        { model: Infrator, as: 'Infrators' }, 
        { model: PedidoCautelar, as: 'PedidoCautelars' }
      ]
    });

    if (!ocorrencia) {
      return res.status(404).json({ message: 'Ocorrência não encontrada ou não pertence à sua cidade.' });
    }
    res.status(200).json(ocorrencia);
  } catch (error) {
    console.error("ERRO DETALHADO EM getOcorrenciaById:", error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da ocorrência.', error: error.message });
  }
};


// @desc    Atualizar uma ocorrência
exports.updateOcorrencia = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const whereClause = { id: req.params.id };
    
    // CORREÇÃO: Garante que o usuário só possa editar ocorrências da sua própria cidade
    if (!req.user.isAdmin) {
      whereClause.cidadeId = req.user.cidadeId;
    }

    const ocorrencia = await Ocorrencia.findOne({ where: whereClause });
    if (!ocorrencia) {
      return res.status(404).json({ message: 'Ocorrência não encontrada ou você não tem permissão para editá-la.' });
    }

    await Vitima.destroy({ where: { ocorrenciaId: ocorrencia.id }, transaction: t });
    await Infrator.destroy({ where: { ocorrenciaId: ocorrencia.id }, transaction: t });
    await PedidoCautelar.destroy({ where: { ocorrenciaId: ocorrencia.id }, transaction: t });

    const { vitimas, infratores, pedidosCautelares, ...dadosOcorrencia } = req.body;
    
    await ocorrencia.update(dadosOcorrencia, { transaction: t });

    for (const vitima of vitimas) {
      await Vitima.create({ ...vitima, ocorrenciaId: ocorrencia.id }, { transaction: t });
    }
    if (dadosOcorrencia.crimeElucidado && infratores && infratores.length > 0) {
      for (const infrator of infratores) {
        await Infrator.create({ ...infrator, ocorrenciaId: ocorrencia.id }, { transaction: t });
      }
    }
    
    if (pedidosCautelares && pedidosCautelares.length > 0) {
      for (const pedido of pedidosCautelares) {
        await PedidoCautelar.create({ ...pedido, ocorrenciaId: ocorrencia.id }, { transaction: t });
      }
    }
    
    await t.commit();
    res.status(200).json({ message: 'Ocorrência atualizada com sucesso!', ocorrencia });

  } catch (error) {
    await t.rollback();
    // CORREÇÃO: Captura de erros de validação
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Erro ao atualizar ocorrência.', error: error.message });
  }
};



// @desc    Excluir uma ocorrência
exports.deleteOcorrencia = async (req, res) => {
  try {
    const whereClause = { id: req.params.id };

    // CORREÇÃO: Garante que o usuário só possa excluir ocorrências da sua própria cidade
    if (!req.user.isAdmin) {
      whereClause.cidadeId = req.user.cidadeId;
    }

    const ocorrencia = await Ocorrencia.findOne({ where: whereClause });
    if (!ocorrencia) {
      return res.status(404).json({ message: 'Ocorrência não encontrada ou você não tem permissão para excluí-la.' });
    }

    await Vitima.destroy({ where: { ocorrenciaId: ocorrencia.id } });
    await Infrator.destroy({ where: { ocorrenciaId: ocorrencia.id } });
    await PedidoCautelar.destroy({ where: { ocorrenciaId: ocorrencia.id } });
    await ocorrencia.destroy();

    res.status(200).json({ message: 'Ocorrência excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir ocorrência.', error: error.message });
  }
};