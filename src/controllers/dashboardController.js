// src/controllers/dashboardController.js
const { Ocorrencia, PedidoCautelar, sequelize,Cidade, Vitima, Infrator } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardSummary = async (req, res) => {
  try {
    // 1. RECEBE OS FILTROS DA REQUISIÇÃO
    const { cidadeId: queryCidadeId, seccionalId: querySeccionalId } = req.query;
    const { id: userId, cidadeId: userCidadeId, isAdmin } = req.user;

    let whereClause = {}; // Cláusula de filtro principal

    // 2. APLICA A LÓGICA DE FILTRO
    if (isAdmin) {
      if (queryCidadeId) {
        // Se uma cidade específica for escolhida, use-a
        whereClause.cidadeId = queryCidadeId;
      } else if (querySeccionalId) {
        // Se uma seccional for escolhida, busca todas as cidades dela
        const cidades = await Cidade.findAll({ where: { seccionalId: querySeccionalId }, attributes: ['id'] });
        const cidadeIds = cidades.map(c => c.id);
        if (cidadeIds.length > 0) {
          whereClause.cidadeId = { [Op.in]: cidadeIds };
        } else {
          // Se a seccional não tiver cidades, retorna resultados vazios
          return res.status(200).json({
            recentOccurrences: [],
            pendingOrdersCount: 0,
            resolvabilityStats: { totalOccurrences: 0, solvedOccurrences: 0 },
            
          });
        }
      }
      // Se nenhum filtro for aplicado pelo admin, whereClause fica vazio ({}), buscando tudo.
    } else {
      // Para usuários normais, a regra continua a mesma (apenas sua cidade)
      whereClause.cidadeId = userCidadeId;
    }

    // --- AS CONSULTAS AGORA USAM A 'whereClause' DINÂMICA ---

    const recentOccurrences = await Ocorrencia.findAll({
      where: whereClause,
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'numeroInquerito', 'dataCrime', 'andamentoProcedimento'],
    });

    const pendingOrdersCount = await PedidoCautelar.count({
      where: { andamento: { [Op.notLike]: '%deferido%' } },
      include: [{
        model: Ocorrencia,
        attributes: [],
        where: whereClause, // Usa a cláusula de filtro aqui
        required: true
      }]
    });
    
    const currentYear = new Date().getFullYear();
    const resolvabilityWhere = { ...whereClause };
    resolvabilityWhere.dataCrime = { [Op.between]: [`${currentYear}-01-01`, `${currentYear}-12-31`] };

    const resolvabilityStats = await Ocorrencia.findOne({
      where: resolvabilityWhere,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOccurrences'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN crimeElucidado = true THEN 1 ELSE 0 END')), 'solvedOccurrences']
      ],
      raw: true,
    });
    
    // Contagem de Vítimas
    const victimsCount = await Vitima.count({
      include: [{ model: Ocorrencia, attributes: [], where: whereClause, required: true }]
    });

    // Contagem de Presos
    const arrestedCount = await Infrator.count({
      where: { preso: true },
      include: [{ model: Ocorrencia, attributes: [], where: whereClause, required: true }]
    });


    // Garante que não retorne null se não houver ocorrências
    const finalResolvabilityStats = resolvabilityStats && resolvabilityStats.totalOccurrences 
      ? resolvabilityStats 
      : { totalOccurrences: 0, solvedOccurrences: 0 };

    res.status(200).json({
      recentOccurrences,
      pendingOrdersCount,
      resolvabilityStats: finalResolvabilityStats,
      victimsCount,   
      arrestedCount,
    });

  } catch (error) {
    console.error("ERRO AO GERAR DADOS DO DASHBOARD:", error);
    res.status(500).json({ message: 'Erro ao buscar dados para o dashboard.', error: error.message });
  }
};