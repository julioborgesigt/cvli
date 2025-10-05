const { 
  Faccao, 
  Bairro, 
  AndamentoProcedimento, 
  Seccional, 
  Cidade,
  TipoPedidoCautelar,
  StatusPedidoCautelar,
  TipoPrisao,
  Ocorrencia 
} = require('../models');

exports.getFormOptions = async (req, res) => {
  try {
    // Objeto de filtro reutilizável para buscar apenas itens ativos
    const whereActive = { where: { ativo: true }, order: [['nome', 'ASC']] };

    // CORREÇÃO: As buscas agora usam o filtro 'whereActive'
    const faccoes = await Faccao.findAll(whereActive);
    const andamentos = await AndamentoProcedimento.findAll(whereActive);
    const cidades = await Cidade.findAll(whereActive);
    const tiposPedido = await TipoPedidoCautelar.findAll({ where: { ativo: true }});
    const statusPedido = await StatusPedidoCautelar.findAll({ where: { ativo: true }});
    const tiposPrisao = await TipoPrisao.findAll({ where: { ativo: true }});
    
    // Seccionais não têm status 'ativo', então a busca continua a mesma
    const seccionais = await Seccional.findAll({ order: [['nome', 'ASC']] });

    let bairros;
    let ocorrencias;
    
    if (req.user.isAdmin) {
      // Para o admin, buscamos todos os bairros e ocorrências (ativos e inativos)
      bairros = await Bairro.findAll({
        where: { ativo: true }, // Adicione esta linha
        order: [['nome', 'ASC']]
      });
      ocorrencias = await Ocorrencia.findAll({ order: [['id', 'DESC']], attributes: ['id', 'numeroInquerito'] });
    } else {
      // Para o usuário comum, buscamos apenas os da sua cidade
      const userCityId = req.user.cidadeId;
      bairros = await Bairro.findAll({ where: { cidadeId: userCityId, ativo: true }, order: [['nome', 'ASC']] }); // Apenas bairros ativos
      ocorrencias = await Ocorrencia.findAll({ where: { cidadeId: userCityId }, order: [['id', 'DESC']], attributes: ['id', 'numeroInquerito'] });
    }

    res.status(200).json({ 
      faccoes, 
      bairros, 
      andamentos, 
      seccionais, 
      cidades,
      tiposPedido,
      statusPedido,
      tiposPrisao,
      ocorrencias
    });

  } catch (error) {
    console.error("ERRO NO SERVIDOR AO BUSCAR OPÇÕES:", error); 
    res.status(500).json({ message: 'Erro ao buscar opções.', error: error.message });
  }
};