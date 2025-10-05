// src/controllers/statisticsController.js
const { Ocorrencia, Cidade, Seccional, Infrator, Vitima, PedidoCautelar, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Obter estatísticas de resolubilidade de crimes
// @route   GET /api/admin/stats/resolvability
// @access  Admin
exports.getResolvabilityStats = async (req, res) => {
  try {
    const { cidadeId, seccionalId, year, month } = req.query;

    const whereClause = {};
    const includeWhereClause = {};

    if (cidadeId) whereClause.cidadeId = cidadeId;
    if (seccionalId) includeWhereClause.seccionalId = seccionalId;

    const dateFilter = [];
    if (year) dateFilter.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('Ocorrencia.dataCrime')), year));
    if (month) dateFilter.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('Ocorrencia.dataCrime')), month));
    if (dateFilter.length > 0) whereClause[Op.and] = dateFilter;

    const stats = await Ocorrencia.findAll({
      where: whereClause,
      include: [{ model: Cidade, attributes: [], where: includeWhereClause }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ocorrencia.id')), 'total_crimes'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN crimeElucidado = true THEN 1 ELSE 0 END')), 'crimes_elucidados']
      ],
      raw: true,
    });
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar estatísticas de resolubilidade.', error: error.message });
  }
};

// ADICIONE A NOVA FUNÇÃO ABAIXO
exports.getMonthlyStats = async (req, res) => {
  try {
    const { year, month, seccionalId, cidadeId } = req.query;

    if (!year) {
      return res.status(400).json({ message: 'Ano é obrigatório.' });
    }

    // A cláusula 'where' principal para a data agora é dinâmica
    const dateFilter = [
      sequelize.where(sequelize.fn('YEAR', sequelize.col('Ocorrencia.dataCrime')), year)
    ];

    // MUDANÇA: Só adiciona o filtro de MÊS se ele for fornecido
    if (month) {
      dateFilter.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('Ocorrencia.dataCrime')), month));
    }

    const whereClause = {
      [Op.and]: dateFilter
    };

    if (cidadeId) {
      whereClause.cidadeId = cidadeId;
    }

    const includeClause = [{
      model: Cidade,
      attributes: [],
    }];

    if (seccionalId) {
      includeClause[0].where = { seccionalId: seccionalId };
    }

    const stats = await Ocorrencia.findAll({
      where: whereClause,
      include: includeClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Ocorrencia.id')), 'total_crimes'],
        [
          sequelize.fn('SUM', sequelize.literal('CASE WHEN crimeElucidado = true THEN 1 ELSE 0 END')),
          'crimes_elucidados'
        ]
      ],
      raw: true,
    });

    res.status(200).json(stats);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar estatísticas.', error: error.message });
  }
};




// ADICIONE A NOVA FUNÇÃO ABAIXO
// dentro de src/controllers/statisticsController.js

// dentro de src/controllers/statisticsController.js

exports.getArrestStatsByCity = async (req, res) => {
  try {
    // MUDANÇA: Extraindo os novos filtros de data e cidade
    const { seccionalId, cidadeId, year, month, sortBy  } = req.query;

    const cidadeWhereClause = {};
    if (seccionalId) {
      cidadeWhereClause.seccionalId = seccionalId;
    }

    // MUDANÇA: Criando a cláusula de filtro para a Ocorrência
    const ocorrenciaWhereClause = {};
    if (cidadeId) {
      ocorrenciaWhereClause.cidadeId = cidadeId;
    }
    const dateFilter = [];
    if (year) {
      dateFilter.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('dataCrime')), year));
    }
    if (month) {
      dateFilter.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('dataCrime')), month));
    }
    if (dateFilter.length > 0) {
      ocorrenciaWhereClause[Op.and] = dateFilter;
    }

    // Usando a sua busca funcional como base
    const infratoresPresos = await Infrator.findAll({
      where: { preso: true },
      attributes: ['id'],
      include: [
        {
          model: Ocorrencia,
          attributes: ['id'],
          required: true,
          where: ocorrenciaWhereClause, // MUDANÇA: Aplicando o novo filtro aqui
          include: [{
            model: Cidade,
            attributes: ['nome'],
            where: cidadeWhereClause,
            required: true
          }]
        }
      ],
    });

    // O resto do seu código funcional, que já sabemos que funciona, permanece sem alterações
    const contagemPorCidade = infratoresPresos.reduce((acc, infrator) => {
      const nomeCidade = infrator.Ocorrencium.Cidade.nome;
      acc[nomeCidade] = (acc[nomeCidade] || 0) + 1;
      return acc;
    }, {});

    const formattedStats = Object.keys(contagemPorCidade).map(nomeCidade => ({
      cidade_nome: nomeCidade,
      total_prisoes: contagemPorCidade[nomeCidade]
    }));

    // 2. APLICA A LÓGICA DE ORDENAÇÃO
    if (sortBy === 'desc') {
      // Maior para o menor (descendente)
      formattedStats.sort((a, b) => b.total_prisoes - a.total_prisoes);
    } else if (sortBy === 'asc') {
      // Menor para o maior (ascendente)
      formattedStats.sort((a, b) => a.total_prisoes - b.total_prisoes);
    } else {
      // Padrão: Maior para o menor, caso nenhum parâmetro seja enviado
      formattedStats.sort((a, b) => b.total_prisoes - a.total_prisoes);
    }


    res.status(200).json(formattedStats);

  } catch (error) {
    console.error("ERRO AO GERAR ESTATÍSTICAS DE PRISÃO:", error); 
    res.status(500).json({ message: 'Erro ao gerar estatísticas de prisão.', error: error.message });
  }
};


// dentro de src/controllers/statisticsController.js

exports.getOrderStatsByCity = async (req, res) => {
  try {
    const { seccionalId, cidadeId, year, month } = req.query;

    // PASSO 1: Buscar IDs das ocorrências filtradas (seu código, já correto)
    const whereOcorrencia = {};
    const dateFilter = [];
    if (year) dateFilter.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('dataCrime')), year));
    if (month) dateFilter.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('dataCrime')), month));
    if (dateFilter.length > 0) whereOcorrencia[Op.and] = dateFilter;
    
    
    if (cidadeId) {
      whereOcorrencia.cidadeId = cidadeId;
    }

    
    const includeCidadeWhere = {};
    if (seccionalId) includeCidadeWhere.seccionalId = seccionalId;

    const ocorrenciasFiltradas = await Ocorrencia.findAll({
      where: whereOcorrencia,
      include: [{
        model: Cidade,
        attributes: ['id', 'nome'], // Pegamos o ID e o nome da cidade
        where: includeCidadeWhere,
        required: true,
      }],
      attributes: ['id', 'cidadeId'], // Pegamos o ID da ocorrência e da cidade
    });

    if (ocorrenciasFiltradas.length === 0) {
      return res.status(200).json([]);
    }

    // Cria um mapa para fácil acesso: { cidadeId: 'Nome da Cidade' }
    const cidadeIdToNameMap = ocorrenciasFiltradas.reduce((acc, o) => {
      acc[o.Cidade.id] = o.Cidade.nome;
      return acc;
    }, {});
    
    const ocorrenciaIds = ocorrenciasFiltradas.map(o => o.id);

    // PASSO 2: Buscar TODOS os pedidos relacionados a essas ocorrências, SEM AGRUPAR
    const pedidos = await PedidoCautelar.findAll({
      where: {
        ocorrenciaId: { [Op.in]: ocorrenciaIds }
      },
    });

    // PASSO 3: Agrupar e contar em JavaScript
    const contagemPorCidade = pedidos.reduce((acc, pedido) => {
      const ocorrenciaPai = ocorrenciasFiltradas.find(o => o.id === pedido.ocorrenciaId);
      if (!ocorrenciaPai) return acc;

      const nomeCidade = ocorrenciaPai.Cidade.nome;
      if (!acc[nomeCidade]) {
        acc[nomeCidade] = { total_pedidos: 0, preventiva: 0, temporaria: 0 };
      }
      
      acc[nomeCidade].total_pedidos += 1;
      if (pedido.tipo === 'P. Preventiva') {
        acc[nomeCidade].preventiva += 1;
      } else if (pedido.tipo === 'P. Temporária') {
        acc[nomeCidade].temporaria += 1;
      }
      return acc;
    }, {});

    // PASSO 4: Formatar o resultado
    const formattedStats = Object.keys(contagemPorCidade).map(nomeCidade => ({
      cidade_nome: nomeCidade,
      total_pedidos: contagemPorCidade[nomeCidade].total_pedidos,
      preventiva: contagemPorCidade[nomeCidade].preventiva,
      temporaria: contagemPorCidade[nomeCidade].temporaria,
    }));

    res.status(200).json(formattedStats);

  } catch (error) {
    console.error("ERRO DETALHADO AO GERAR ESTATÍSTICAS DE PEDIDOS:", error);
    res.status(500).json({ message: 'Erro ao gerar estatísticas de pedidos.', error: error.message });
  }
};



exports.getFactionStats = async (req, res) => {
  try {
    const { cidadeId, seccionalId, year, month } = req.query;

    // 1. Monta as cláusulas de filtro (reaproveitando a lógica que já temos)
    const whereOcorrencia = {};
    const dateFilter = [];
    if (year) dateFilter.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('dataCrime')), year));
    if (month) dateFilter.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('dataCrime')), month));
    if (dateFilter.length > 0) whereOcorrencia[Op.and] = dateFilter;
    if (cidadeId) whereOcorrencia.cidadeId = cidadeId;

    const includeCidadeWhere = {};
    if (seccionalId) includeCidadeWhere.seccionalId = seccionalId;

    const includeClause = [{
      model: Cidade,
      attributes: [],
      where: includeCidadeWhere,
      required: true
    }];

    // 2. Calcula as três métricas separadamente
    const crimesPorArea = await Ocorrencia.findAll({
      where: { ...whereOcorrencia, faccaoArea: { [Op.ne]: null, [Op.ne]: '' } },
      include: includeClause,
      attributes: ['faccaoArea', [sequelize.fn('COUNT', 'Ocorrencia.id'), 'total']],
      group: ['faccaoArea']
    });

    const infratoresPorFaccao = await Infrator.findAll({
      include: [{ model: Ocorrencia, attributes: [], where: whereOcorrencia, include: includeClause, required: true }],
      where: { faccao: { [Op.ne]: null, [Op.ne]: '' } },
      attributes: ['faccao', [sequelize.fn('COUNT', 'Infrator.id'), 'total']],
      group: ['faccao']
    });
    
    const vitimasPorFaccao = await Vitima.findAll({
      include: [{ model: Ocorrencia, attributes: [], where: whereOcorrencia, include: includeClause, required: true }],
      where: { faccao: { [Op.ne]: null, [Op.ne]: '' } },
      attributes: ['faccao', [sequelize.fn('COUNT', 'Vitima.id'), 'total']],
      group: ['faccao']
    });

    // 3. Consolida os resultados em um único objeto
    const stats = {};
    const addData = (dataset, keyName, faccaoField) => {
      dataset.forEach(item => {
        const faccao = item.get(faccaoField);
        const total = item.get('total');
        if (!stats[faccao]) {
          stats[faccao] = { crimes_area: 0, infratores: 0, vitimas: 0 };
        }
        stats[faccao][keyName] = total;
      });
    };
    
    addData(crimesPorArea, 'crimes_area', 'faccaoArea');
    addData(infratoresPorFaccao, 'infratores', 'faccao');
    addData(vitimasPorFaccao, 'vitimas', 'faccao');

    // 4. Formata para uma lista ordenada
    const formattedStats = Object.keys(stats).map(faccao => ({
      faccao,
      ...stats[faccao]
    })).sort((a, b) => (b.infratores + b.crimes_area) - (a.infratores + a.crimes_area));

    res.status(200).json(formattedStats);
  } catch (error) {
    console.error("ERRO AO GERAR ESTATÍSTICAS DE FACÇÃO:", error);
    res.status(500).json({ message: 'Erro ao gerar estatísticas de facção.', error: error.message });
  }
};

exports.getArrestTypesStats = async (req, res) => {
  try {
    const { cidadeId, seccionalId, year, month } = req.query;

    // 1. Monta as cláusulas de filtro para a ocorrência
    const whereOcorrencia = {};
    const dateFilter = [];
    if (year) dateFilter.push(sequelize.where(sequelize.fn('YEAR', sequelize.col('dataCrime')), year));
    if (month) dateFilter.push(sequelize.where(sequelize.fn('MONTH', sequelize.col('dataCrime')), month));
    if (dateFilter.length > 0) whereOcorrencia[Op.and] = dateFilter;
    if (cidadeId) whereOcorrencia.cidadeId = cidadeId;

    const includeCidadeWhere = {};
    if (seccionalId) includeCidadeWhere.seccionalId = seccionalId;

    // 2. Executa a consulta no modelo Infrator
    const stats = await Infrator.findAll({
      where: {
        preso: true, // Apenas infratores que foram presos
        tipoPrisao: { [Op.ne]: null, [Op.ne]: '' } // Ignora tipos de prisão nulos ou vazios
      },
      include: [{
        model: Ocorrencia,
        attributes: [], // Não precisamos dos campos da ocorrência no resultado final
        where: whereOcorrencia, // Aplica os filtros de data e local aqui
        required: true,
        include: [{
          model: Cidade,
          attributes: [],
          where: includeCidadeWhere, // Aplica o filtro de seccional
          required: true
        }]
      }],
      attributes: [
        'tipoPrisao', // O campo que queremos agrupar
        [sequelize.fn('COUNT', 'Infrator.id'), 'total'] // Conta quantos infratores por tipo
      ],
      group: ['tipoPrisao'],
      order: [[sequelize.fn('COUNT', 'Infrator.id'), 'DESC']] // Ordena do tipo mais comum para o menos comum
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error("ERRO AO GERAR ESTATÍSTICAS DE TIPOS DE PRISÃO:", error);
    res.status(500).json({ message: 'Erro ao gerar estatísticas de tipos de prisão.', error: error.message });
  }
};